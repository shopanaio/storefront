import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildSchema, graphql } from 'graphql';

import { gid, money } from '../src/fixture-helpers.js';
import { createMockStore } from '../src/mock-store.js';
import { applyFreeShipping, evaluatePromotions } from '../src/promotions.js';
import { applyResolvers } from '../src/resolvers.js';

const typeDefs = readFileSync(
  new URL('../schema.graphql', import.meta.url),
  'utf8'
);

const startsAt = '2026-10-01T00:00:00.000Z';
const copy = (headline) => ({
  headline,
  badge: headline,
  description: null,
  accessibilityLabel: headline,
  terms: null,
});
const promotion = (overrides) => ({
  minimumSubtotal: null,
  minimumQuantity: null,
  appliesOnOneTimePurchase: true,
  appliesOnSubscription: true,
  startsAt,
  endsAt: null,
  ...overrides,
});

const product = (key, categoryKey) => ({
  id: gid('Product', key),
  primaryCategoryId: gid('Category', categoryKey),
  categoryIds: [gid('Category', categoryKey)],
  features: [],
});
const variant = (key, price) => ({
  id: gid('ProductVariant', key),
  productId: gid('Product', key),
  title: key,
  sku: key.toUpperCase(),
  availableForSale: true,
  quantityAvailable: 100,
  price: money(price, 'UAH'),
});

const setup = ({ promotions } = {}) => {
  const store = createMockStore({
    now: '2026-10-20T12:00:00.000Z',
    data: {
      products: [product('food', 'food'), product('toy', 'toys')],
      productVariants: [variant('food', 500), variant('toy', 300)],
      checkouts: [],
      promotions: promotions ?? [
        promotion({
          key: 'food-15',
          kind: 'PRODUCT_DISCOUNT',
          sortOrder: 1,
          presentation: copy('−15% on food from 3'),
          value: { type: 'PERCENTAGE', percentage: '15' },
          minimumQuantity: 3,
          targets: { categoryIds: [gid('Category', 'food')] },
        }),
        promotion({
          key: 'free-shipping',
          kind: 'FREE_SHIPPING',
          sortOrder: 2,
          presentation: copy('Free shipping from ₴1 500'),
          value: { type: 'FREE_SHIPPING' },
          minimumSubtotal: money(1500, 'UAH'),
        }),
        promotion({
          key: 'later',
          kind: 'ORDER_DISCOUNT',
          presentation: copy('Starts later'),
          value: { type: 'FIXED_AMOUNT', amount: money(100, 'UAH') },
          startsAt: '2026-11-01T00:00:00.000Z',
        }),
      ],
    },
  });
  const schema = applyResolvers(buildSchema(typeDefs), store);
  const run = async (source, variableValues = {}) => {
    const result = await graphql({
      schema,
      source,
      variableValues,
      contextValue: { customer: null },
    });
    assert.equal(result.errors, undefined, JSON.stringify(result.errors));
    return JSON.parse(JSON.stringify(result.data));
  };
  return { store, run };
};

const REQUIREMENT = `type remaining { amount } remainingQuantity ratio`;
const CART = `
  cost { subtotalAmount { amount } totalDiscountAmount { amount } }
  promotionProgress { promotion { key } status requirement { ${REQUIREMENT} } }
  freeShippingProgress { status source title promotion { key } requirement { ${REQUIREMENT} } }
  appliedPromotions { title discountClass amount { amount } promotion { key } }
`;

const createCart = async (run, items) =>
  (
    await run(
      `mutation($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) { checkout { ${CART} } userErrors { code } }
      }`,
      {
        input: {
          channelCode: 'online-store',
          localeCode: 'uk',
          currencyCode: 'UAH',
          items,
        },
      }
    )
  ).checkoutCreate.checkout;

test('a variant sees the promotions of its targets and every order-wide one', async () => {
  const { run } = setup();
  const data = await run(`{
    food: node(id: "${gid('ProductVariant', 'food')}") {
      ... on ProductVariant { promotions { promotions { key } validUntil } }
    }
    toy: node(id: "${gid('ProductVariant', 'toy')}") {
      ... on ProductVariant { promotions { promotions { key } } }
    }
    shipping: storefrontPromotions(kinds: [FREE_SHIPPING]) { promotions { key } }
    none: storefrontPromotions(kinds: []) { promotions { key } }
  }`);
  assert.deepEqual(
    data.food.promotions.promotions.map(({ key }) => key),
    ['food-15', 'free-shipping']
  );
  assert.equal(data.food.promotions.validUntil, '2026-11-01T00:00:00.000Z');
  assert.deepEqual(
    data.toy.promotions.promotions.map(({ key }) => key),
    ['free-shipping']
  );
  assert.deepEqual(data.shipping.promotions, [{ key: 'free-shipping' }]);
  assert.deepEqual(data.none.promotions, []);
});

test('the cart shows how far each threshold is', async () => {
  const { run } = setup();
  const cart = await createCart(run, [
    { purchasableId: gid('ProductVariant', 'food'), quantity: 1 },
  ]);
  assert.deepEqual(
    cart.promotionProgress.map(({ promotion, status, requirement }) => [
      promotion.key,
      status,
      requirement.remaining?.amount ?? requirement.remainingQuantity,
      requirement.ratio,
    ]),
    [
      ['food-15', 'IN_PROGRESS', 2, '0.3333'],
      ['free-shipping', 'IN_PROGRESS', '1000.00', '0.3333'],
    ]
  );
  assert.equal(cart.freeShippingProgress.status, 'IN_PROGRESS');
  assert.equal(cart.freeShippingProgress.source, null);
  assert.equal(
    cart.freeShippingProgress.requirement.remaining.amount,
    '1000.00'
  );
  assert.deepEqual(cart.appliedPromotions, []);
});

test('a product discount does not lower the free shipping threshold', async () => {
  const { run } = setup();
  const cart = await createCart(run, [
    { purchasableId: gid('ProductVariant', 'food'), quantity: 3 },
  ]);
  assert.deepEqual(
    cart.promotionProgress.map(({ status }) => status),
    ['SATISFIED', 'SATISFIED']
  );
  assert.deepEqual(cart.appliedPromotions, [
    {
      title: '−15% on food from 3',
      discountClass: 'PRODUCT',
      amount: { amount: '225.00' },
      promotion: { key: 'food-15' },
    },
  ]);
  assert.equal(cart.cost.totalDiscountAmount.amount, '225.00');
  assert.equal(cart.freeShippingProgress.status, 'SATISFIED');
  assert.equal(cart.freeShippingProgress.source, 'DISCOUNT');
  assert.equal(cart.freeShippingProgress.promotion.key, 'free-shipping');
});

test('free shipping makes the selected delivery free up to its limit', () => {
  const { store } = setup({
    promotions: [
      promotion({
        key: 'free-shipping',
        kind: 'FREE_SHIPPING',
        presentation: copy('Free shipping'),
        value: {
          type: 'FREE_SHIPPING',
          maximumShippingPrice: money(50, 'UAH'),
        },
      }),
    ],
  });
  const group = (cost) => ({
    selection: { option: { cost: money(cost, 'UAH') } },
  });
  const checkout = {
    currencyCode: 'UAH',
    lines: [
      {
        purchasableId: gid('ProductVariant', 'toy'),
        quantity: 1,
        purchase: { type: 'ONE_TIME' },
        cost: { subtotalAmount: money(300, 'UAH') },
      },
    ],
    deliveryGroups: [group(40), group(90)],
  };
  const shipping = applyFreeShipping(
    checkout,
    evaluatePromotions(store, checkout),
    null
  );
  assert.equal(shipping, 90);
  assert.deepEqual(checkout.deliveryGroups[0].freeShipping, {
    source: 'DISCOUNT',
    title: 'Free shipping',
    code: null,
  });
  assert.equal(checkout.deliveryGroups[1].freeShipping, null);
  assert.equal(checkout.freeShippingProgress.appliesToSelectedDelivery, true);
  assert.equal(checkout.freeShippingProgress.requirement, null);
  assert.deepEqual(checkout.appliedPromotions.at(-1).amount, money(40, 'UAH'));
});

test('a loyalty reward makes shipping free and keeps the nearest threshold', () => {
  const { store } = setup();
  const checkout = {
    currencyCode: 'UAH',
    lines: [
      {
        purchasableId: gid('ProductVariant', 'toy'),
        quantity: 1,
        purchase: { type: 'ONE_TIME' },
        cost: { subtotalAmount: money(300, 'UAH') },
      },
    ],
    deliveryGroups: [{ selection: { option: { cost: money(60, 'UAH') } } }],
  };
  const shipping = applyFreeShipping(
    checkout,
    evaluatePromotions(store, checkout),
    { headline: 'Free delivery' }
  );
  assert.equal(shipping, 0);
  assert.equal(checkout.freeShippingProgress.source, 'LOYALTY_REWARD');
  assert.equal(checkout.freeShippingProgress.title, 'Free delivery');
  assert.equal(
    checkout.freeShippingProgress.nextRequirement.remaining.amount,
    '1200.00'
  );
});
