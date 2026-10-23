import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildSchema, graphql } from 'graphql';

import { gid } from '../src/fixture-helpers.js';
import { createMockStore } from '../src/mock-store.js';
import { applyResolvers } from '../src/resolvers.js';

const typeDefs = readFileSync(
  new URL('../schema.graphql', import.meta.url),
  'utf8'
);

const setup = ({ signedIn = true } = {}) => {
  const customer = {
    id: gid('Customer', 'loyal'),
    comparisonVariantIds: [],
    addresses: [],
    orderIds: [],
  };
  const product = {
    id: gid('Product', 'food'),
    primaryCategoryId: gid('Category', 'food'),
    features: [],
  };
  const variant = {
    id: gid('ProductVariant', 'food'),
    productId: product.id,
    title: 'Food',
    sku: 'FOOD',
    availableForSale: true,
    quantityAvailable: 100,
    price: { amount: '1000.00', currencyCode: 'UAH' },
  };
  const store = createMockStore({
    now: '2026-10-20T12:00:00.000Z',
    data: {
      customers: [customer],
      products: [product],
      productVariants: [variant],
      checkouts: [],
      reviews: [],
      reviewMedia: [],
      reviewReplies: [],
      productQuestions: [],
      productQuestionAnswers: [],
      reviewRequests: [],
      reviewStoreConfiguration: { maxReviewMediaCount: 5 },
      loyaltyProgram: {
        id: gid('LoyaltyProgram', 'bonus'),
        status: 'ACTIVE',
        currencyCode: 'UAH',
        pointValue: 0.1,
        earnPointsPerUnit: 0.1,
        minimumRedeemPoints: 100,
        maximumRedeemPointsPerOrder: 5_000,
        maximumOrderPercentageBps: 5_000,
        storeCreditRedemptionEnabled: true,
        tier: { code: 'gold', name: 'Gold', earnMultiplierBps: 15_000 },
        account: {
          availablePoints: 1_240,
          pendingPoints: 0,
          storeCredit: 240,
          rewards: [
            {
              id: gid('LoyaltyAvailableReward', 'ship'),
              kind: 'FREE_SHIPPING',
              headline: 'Free delivery',
            },
          ],
        },
      },
    },
  });
  const schema = applyResolvers(buildSchema(typeDefs), store);
  const contextValue = { customer: signedIn ? store.state.customers[0] : null };
  const run = async (source, variableValues = {}) => {
    const result = await graphql({
      schema,
      source,
      variableValues,
      contextValue,
    });
    assert.equal(result.errors, undefined, JSON.stringify(result.errors));
    return result.data;
  };
  return { store, run, variant };
};

const CHECKOUT = `
  id
  cost { totalAmount { amount } loyaltyAmount { amount } totalDiscountAmount { amount } }
  loyaltyRedemption { source requestedPoints points discount { amount } }
  loyaltyRewardId
  loyaltySelection { source points amount { amount } rewardId }
  loyaltyEarning { state points presentation { headline } }
  issues { code effect field }
`;

const create = async (run, variant) => {
  const data = await run(
    `mutation($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) { checkout { ${CHECKOUT} } userErrors { code } }
  }`,
    {
      input: {
        channelCode: 'online-store',
        localeCode: 'uk',
        currencyCode: 'UAH',
        items: [{ purchasableId: variant.id, quantity: 1 }],
      },
    }
  );
  assert.deepEqual(data.checkoutCreate.userErrors, []);
  return data.checkoutCreate.checkout;
};

const update = async (run, input) =>
  (
    await run(
      `mutation($input: CheckoutLoyaltyRedemptionUpdateInput!) {
  checkoutLoyaltyRedemptionUpdate(input: $input) { checkout { ${CHECKOUT} } userErrors { code } }
}`,
      { input }
    )
  ).checkoutLoyaltyRedemptionUpdate;

test('the account lists its sources, tier and rewards', async () => {
  const { run } = setup();
  const data = await run(`{ customer { loyaltyAccount {
    balance { availablePoints }
    storeCredit { availableAmount { amount } pendingAmount { amount } upcomingExpirations { amount { amount } expiresAt } }
    tier { name earnMultiplierBps }
    redemptionSources { source availablePoints availableAmount { amount } minimum { points } }
    availableRewards { nodes { id presentation { headline } reward { kind } } }
  } } }`);
  const account = data.customer.loyaltyAccount;
  assert.equal(account.balance.availablePoints, '1240');
  assert.equal(account.tier.earnMultiplierBps, 15_000);
  assert.deepEqual(
    account.redemptionSources.map(({ source }) => source),
    ['POINTS', 'STORE_CREDIT']
  );
  assert.equal(account.availableRewards.nodes[0].reward.kind, 'FREE_SHIPPING');
  assert.equal(account.storeCredit.availableAmount.amount, '240.00');
});

test('points pay part of the total; a request above the balance is refused', async () => {
  const { run, variant } = setup();
  const checkout = await create(run, variant);
  assert.equal(checkout.loyaltyEarning.state, 'AVAILABLE');

  const maximum = await update(run, {
    checkoutId: checkout.id,
    source: 'POINTS',
  });
  assert.deepEqual(maximum.userErrors, []);
  assert.equal(maximum.checkout.loyaltyRedemption.points, '1240');
  assert.equal(maximum.checkout.cost.loyaltyAmount.amount, '124.00');
  assert.equal(maximum.checkout.cost.totalDiscountAmount.amount, '0.00');

  const tooMany = await update(run, {
    checkoutId: checkout.id,
    source: 'POINTS',
    points: '2000',
  });
  assert.equal(tooMany.checkout.loyaltyRedemption, null);
  // The choice stays saved although the calculation refused it.
  assert.deepEqual(
    { ...tooMany.checkout.loyaltySelection },
    {
      source: 'POINTS',
      points: '2000',
      amount: null,
      rewardId: null,
    }
  );
  assert.deepEqual(
    tooMany.checkout.issues.map(({ code, effect }) => [code, effect]),
    [['REQUEST_EXCEEDS_AVAILABLE_POINTS', 'STOP']]
  );

  const custom = await update(run, {
    checkoutId: checkout.id,
    source: 'POINTS',
    points: '300',
  });
  assert.equal(custom.checkout.loyaltyRedemption.requestedPoints, '300');
  assert.equal(custom.checkout.loyaltyRedemption.discount.amount, '30.00');
});

test('store credit replaces points in one write, and a reward keeps the source', async () => {
  const { run, variant } = setup();
  const checkout = await create(run, variant);
  await update(run, { checkoutId: checkout.id, source: 'POINTS' });
  const credit = await update(run, {
    checkoutId: checkout.id,
    source: 'STORE_CREDIT',
    amount: '80',
  });
  assert.equal(credit.checkout.loyaltyRedemption.source, 'STORE_CREDIT');
  assert.equal(credit.checkout.cost.loyaltyAmount.amount, '80.00');
  assert.equal(credit.checkout.loyaltySelection.amount.amount, '80.00');

  const reward = await update(run, {
    checkoutId: checkout.id,
    source: 'STORE_CREDIT',
    amount: '80',
    rewardId: gid('LoyaltyAvailableReward', 'ship'),
  });
  assert.equal(
    reward.checkout.loyaltyRewardId,
    gid('LoyaltyAvailableReward', 'ship')
  );
  assert.equal(reward.checkout.loyaltyRedemption.source, 'STORE_CREDIT');
});

test('a write with neither a source nor a reward is refused', async () => {
  const { run, variant } = setup();
  const checkout = await create(run, variant);
  const result = await update(run, { checkoutId: checkout.id });
  assert.deepEqual(
    result.userErrors.map(({ code }) => code),
    ['LOYALTY_SELECTION_REQUIRED']
  );
});

test('a guest is invited to sign in for the points', async () => {
  const { run, variant } = setup({ signedIn: false });
  const checkout = await create(run, variant);
  assert.equal(checkout.loyaltyEarning.state, 'AUTHENTICATION_REQUIRED');
  const result = await update(run, {
    checkoutId: checkout.id,
    source: 'POINTS',
  });
  assert.deepEqual(
    result.userErrors.map(({ code }) => code),
    ['LOYALTY_CUSTOMER_REQUIRED']
  );
});
