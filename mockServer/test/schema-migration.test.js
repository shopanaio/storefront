import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildSchema, graphql, parse, validate } from 'graphql';

import { gid } from '../src/fixture-helpers.js';
import { createMockStore } from '../src/mock-store.js';
import { applyResolvers } from '../src/resolvers.js';

const typeDefs = readFileSync(
  new URL('../schema.graphql', import.meta.url),
  'utf8'
);
const setup = () => {
  const customer = {
    id: gid('Customer', 'test'),
    comparisonVariantIds: [],
    addresses: [],
  };
  const product = {
    id: gid('Product', 'test'),
    primaryCategoryId: gid('Category', 'test'),
    features: [],
  };
  const variant = { id: gid('ProductVariant', 'test'), productId: product.id };
  const store = createMockStore({
    now: '2026-08-03T12:00:00.000Z',
    data: {
      customers: [customer],
      products: [product],
      productVariants: [variant],
      checkouts: [],
      reviews: [
        {
          id: gid('Review', 'test'),
          author: { customerId: customer.id },
          revision: 1,
          metrics: {},
          mediaIds: [],
          replyIds: [],
        },
      ],
      reviewMedia: [],
      reviewReplies: [],
      productQuestions: [],
      productQuestionAnswers: [],
      reviewRequests: [],
      reviewStoreConfiguration: { maxReviewMediaCount: 5 },
    },
  });
  const schema = applyResolvers(buildSchema(typeDefs), store);
  const contextValue = { customer: store.state.customers[0] };
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
  return { store, schema, run };
};

const newCheckout = async (run) => {
  const result = await run(
    `mutation($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) { checkout { id status expiresAt resultRevision } userErrors { code } }
  }`,
    {
      input: {
        channelCode: 'online-store',
        localeCode: 'en',
        currencyCode: 'USD',
        items: [],
      },
    }
  );
  assert.deepEqual(result.checkoutCreate.userErrors, []);
  return result.checkoutCreate.checkout;
};

test('checkout creation and updates use the new inputs and lifecycle fields', async () => {
  const { run, store } = setup();
  const first = await newCheckout(run);
  const second = await newCheckout(run);
  assert.notEqual(first.id, second.id);
  assert.equal(first.status, 'OPEN');
  assert.ok(Date.parse(first.expiresAt) > store.clock);
  assert.equal(Object.hasOwn(store.get(first.id), 'version'), false);
  const result = await run(
    `mutation($input: CheckoutCustomerNoteUpdateInput!) {
    checkoutCustomerNoteUpdate(input: $input) {
      checkout { customerNote resultRevision } userErrors { code }
    }
  }`,
    { input: { checkoutId: first.id, note: 'No version required' } }
  );
  assert.deepEqual(result.checkoutCustomerNoteUpdate.userErrors, []);
  assert.equal(
    result.checkoutCustomerNoteUpdate.checkout.customerNote,
    'No version required'
  );
  assert.notEqual(
    result.checkoutCustomerNoteUpdate.checkout.resultRevision,
    first.resultRevision
  );
  store.get(first.id).expiresAt = '2026-08-01T00:00:00.000Z';
  const expired = await run(
    `mutation($input: CheckoutCustomerNoteUpdateInput!) {
    checkoutCustomerNoteUpdate(input: $input) { checkout { id } userErrors { code } }
  }`,
    { input: { checkoutId: first.id, note: 'Too late' } }
  );
  assert.equal(
    expired.checkoutCustomerNoteUpdate.userErrors[0].code,
    'CHECKOUT_NOT_OPEN'
  );
  assert.equal(store.get(first.id).status, 'EXPIRED');
});

test('comparison selection no longer requires expectedRevision and retains idempotency', async () => {
  const { run, store } = setup();
  const source = `mutation($input: CustomerComparisonVariantAddInput!) {
    customerComparisonVariantAdd(input: $input) { revision customer { id } userErrors { code } }
  }`;
  const variables = {
    input: {
      variantId: store.state.productVariants[0].id,
      idempotencyKey: 'add-test',
    },
  };
  const first = await run(source, variables);
  assert.deepEqual(first.customerComparisonVariantAdd.userErrors, []);
  assert.equal(first.customerComparisonVariantAdd.revision, 1);
  assert.deepEqual(await run(source, variables), first);
  assert.equal(store.state.customers[0].comparisonVariantIds.length, 1);
});

test('review updates and deletes no longer require expectedRevision', async () => {
  const { run, store } = setup();
  const id = store.state.reviews[0].id;
  const updated = await run(
    `mutation($input: ReviewUpdateInput!) {
    reviewUpdate(input: $input) { review { id revision body } userErrors { code } }
  }`,
    { input: { reviewId: id, content: { body: 'New content' } } }
  );
  assert.deepEqual(updated.reviewUpdate.userErrors, []);
  assert.equal(updated.reviewUpdate.review.revision, 2);
  assert.equal(updated.reviewUpdate.review.body, 'New content');
  const deleted = await run(
    `mutation($input: ReviewContentDeleteInput!) {
    reviewDelete(input: $input) { deletedReviewId userErrors { code } }
  }`,
    { input: { id } }
  );
  assert.equal(deleted.reviewDelete.deletedReviewId, id);
  assert.equal(store.get(id), null);
});

test('removed fields are rejected by GraphQL validation', () => {
  const { schema } = setup();
  for (const source of [
    '{ checkout(id: "test") { version } }',
    '{ checkoutPlacement(id: "test") { checkoutVersion } }',
    '{ customer { productComparisons { revision } } }',
    '{ onlineStorePageByHandle(handle: "test") { content { body { text } } } }',
    'mutation { checkoutCustomerNoteUpdate(input: { checkoutId: "test", note: "test", expectedCheckoutVersion: 1 }) { userErrors { code } } }',
    '{ checkout(id: "test") { appliedPromoCodes { code } } }',
  ])
    assert.ok(validate(schema, parse(source)).length > 0, source);
});

test('promo codes are listed with their state', async () => {
  const { run } = setup();
  const checkout = await newCheckout(run);
  const result = await run(
    `mutation($input: CheckoutPromoCodeAddInput!) {
    checkoutPromoCodeAdd(input: $input) {
      checkout { promoCodes { code status reason message } } userErrors { code }
    }
  }`,
    { input: { checkoutId: checkout.id, code: 'save10' } }
  );
  assert.deepEqual(
    result.checkoutPromoCodeAdd.checkout.promoCodes.map((promo) => ({
      ...promo,
    })),
    [{ code: 'SAVE10', status: 'APPLIED', reason: null, message: null }]
  );
});
