import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ApolloClient } from '@apollo/client';
import { createApolloCache } from '../../graphql/apollo/cache';
import { SchemaLink } from '@apollo/client/link/schema';
import type { GraphQLObjectType } from 'graphql';
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';
import * as documents from '../../graphql/apollo/generated/operations';
import {
  createStorefrontApi,
  StorefrontMutationError,
  handlePlaceOrderCustomerAction,
} from './index';
import { mapShopanaCheckoutToEntityCart } from '../cart/core/mappers/mapShopanaToEntityCart';

const { buildSchema, validate } = createRequire(
  resolve(__dirname, 'index.test.ts')
)('graphql') as typeof import('graphql');
const sdl = readFileSync(
  resolve(__dirname, '../../../../../mockServer/schema.graphql'),
  'utf8'
);
const money = { amount: '10.00', currencyCode: 'USD' };
const checkout = {
  id: 'checkout-1',
  channelCode: 'online-store',
  localeCode: 'en',
  currencyCode: 'USD',
  resultRevision: 'r2',
  valid: true,
  status: 'READY',
  expiresAt: '2026-08-04T12:00:00Z',
  issues: [],
  createdAt: '2026-08-03T12:00:00Z',
  updatedAt: '2026-08-03T12:10:00Z',
  totalQuantity: 0,
  lines: [],
  tags: [],
  notifications: [],
  guestCheckoutAllowed: true,
  promoCodes: [],
  loyaltyEarning: null,
  cost: {
    subtotalAmount: money,
    totalAmount: money,
    totalDiscountAmount: money,
    totalTaxAmount: money,
    totalShippingAmount: money,
    merchandiseDiscountAmount: money,
    loyaltyAmount: money,
  },
  loyaltyRewardId: 'reward-1',
  loyaltyRedemption: {
    quoteId: 'quote-1',
    revision: 'r2',
    accountId: 'account-1',
    programId: 'program-1',
    programCode: 'bonus',
    programVersion: 1,
    source: 'POINTS',
    requestedPoints: 50,
    requestedAmount: null,
    points: 50,
    availablePoints: 100,
    availableAmount: { amount: '1.00', currencyCode: 'USD' },
    discount: { amount: '0.50', currencyCode: 'USD' },
    payableAfterLoyalty: { amount: '9.50', currencyCode: 'USD' },
    expiresAt: '2026-08-04T12:00:00Z',
  },
};
function setup() {
  const schema = buildSchema(sdl);
  const query = schema.getQueryType()!.getFields();
  const mutation = schema.getMutationType()!.getFields();
  mutation.checkoutLoyaltyRedemptionUpdate.resolve = () => ({
    checkout,
    userErrors: [],
  });
  mutation.checkoutLoyaltyRedemptionRemove.resolve = () => ({
    checkout: {
      ...checkout,
      loyaltyRedemption: null,
      loyaltyRewardId: null,
    },
    userErrors: [],
  });
  const client = new ApolloClient({
    cache: createApolloCache(),
    link: new SchemaLink({ schema }),
  });
  return { schema, query, mutation, client, api: createStorefrontApi(client) };
}

describe('Storefront API', () => {
  it('validates every SDK operation against the current schema', () => {
    const schema = buildSchema(sdl);
    const operations = Object.entries(documents).filter(([name]) =>
      name.endsWith('Document')
    );
    expect(operations.length).toBeGreaterThan(12);
    for (const [name, document] of operations)
      expect(validate(schema, document), name).toEqual([]);
  });
  it('maps lifecycle and loyalty fields and updates the normalized cart', async () => {
    const { api, client } = setup();
    const raw = await api.updateLoyaltyRedemption({
      checkoutId: checkout.id,
      source: 'POINTS',
      points: 50,
      rewardId: 'reward-1',
    });
    const cart = mapShopanaCheckoutToEntityCart(raw!);
    expect(cart.status).toBe('READY');
    expect(cart.expiresAt).toEqual(new Date(checkout.expiresAt));
    expect(cart.resultRevision).toBe('r2');
    expect(cart.loyaltyRewardId).toBe('reward-1');
    expect(cart.loyaltyRedemption?.discount.amount).toBe(0.5);
    expect(cart.loyaltyRedemption?.payableAfterLoyalty.amount).toBe(9.5);
    expect(cart.loyaltyRedemption?.expiresAt).toBeInstanceOf(Date);
    await api.removeLoyaltyRedemption({ checkoutId: checkout.id });
    const cached = client.cache.readFragment({
      id: `Checkout:${checkout.id}`,
      fragment: documents.SdkCartFragment_CartFragmentDoc,
      fragmentName: 'SdkCartFragment_cart',
    });
    expect(cached?.loyaltyRedemption).toBeNull();
    expect(cached?.loyaltyRewardId).toBeNull();
  });
  it('rejects mutation business errors', async () => {
    const { api, mutation } = setup();
    mutation.checkoutLoyaltyRedemptionUpdate.resolve = () => ({
      checkout: null,
      userErrors: [
        { code: 'NO_POINTS', message: 'Not enough points', retryable: false },
      ],
    });
    await expect(
      api.updateLoyaltyRedemption({ checkoutId: checkout.id })
    ).rejects.toBeInstanceOf(StorefrontMutationError);
  });
  it('preserves placement state and dispatches CLIENT_SDK metadata', async () => {
    const { api, mutation, query } = setup();
    const placement = {
      placementId: 'placement-1',
      placementState: 'PAYMENT_CREATED',
      status: 'REQUIRES_ACTION',
      userErrors: [],
      customerAction: {
        type: 'CLIENT_SDK',
        sdk: 'mock-payments',
        params: { sessionId: 'session-1' },
      },
    };
    mutation.placeOrder.resolve = (_, { input }) => {
      expect(input.idempotencyKey).toBe('attempt-1');
      expect(input.expectedTotal).toEqual(money);
      return placement;
    };
    query.checkoutPlacement.resolve = () => placement;
    const result = await api.placeOrder({
      checkoutId: checkout.id,
      idempotencyKey: 'attempt-1',
      expectedTotal: money,
    });
    expect(result.placementState).toBe('PAYMENT_CREATED');
    const handlers = {
      clientSdk: vi.fn(),
      redirect: vi.fn(),
      instructions: vi.fn(),
    };
    await handlePlaceOrderCustomerAction(result.customerAction!, handlers);
    expect(handlers.clientSdk).toHaveBeenCalledWith(
      'mock-payments',
      { sessionId: 'session-1' },
      result.customerAction
    );
    expect(
      (await api.loadCheckoutPlacement({ id: 'placement-1' }))?.customerAction
        ?.params
    ).toEqual({ sessionId: 'session-1' });
    await expect(
      handlePlaceOrderCustomerAction(
        { ...result.customerAction!, sdk: null },
        handlers
      )
    ).rejects.toThrow('SDK identifier');
  });
  it('loads collections, nullable media, option types and image transformations', async () => {
    const { api, query, schema } = setup();
    const collection = {
      id: 'collection-1',
      name: 'Summer',
      handle: 'summer',
      type: 'RULE',
      defaultSort: 'NEWEST',
      defaultSortDirection: 'DESC',
      publishedAt: checkout.createdAt,
      createdAt: checkout.createdAt,
      updatedAt: checkout.updatedAt,
      seo: { openGraph: {} },
      media: {
        edges: [{ cursor: '1', node: null }],
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        totalCount: 1,
      },
    };
    query.collection.resolve = () => collection;
    query.collectionByHandle.resolve = () => collection;
    expect(
      (await api.loadCollectionByHandle({ handle: 'summer' }))?.defaultSort
    ).toBe('NEWEST');
    expect((await api.loadCollection({ id: collection.id }))?.type).toBe(
      'RULE'
    );
    expect(
      (await api.loadCollectionMedia({ id: collection.id, first: 10 }))
        ?.edges[0].node
    ).toBeNull();
    query.product.resolve = () => ({
      id: 'product-1',
      options: [
        {
          id: 'option-1',
          name: 'Size',
          handle: 'size',
          position: 0,
          type: { id: 'type-1', name: 'Apparel size', handle: 'apparel-size' },
          optionValues: [
            { id: 'value-1', name: 'M', handle: 'm', position: 0 },
          ],
        },
      ],
    });
    expect(
      (await api.loadProductOptions({ id: 'product-1' }))?.[0].type?.handle
    ).toBe('apparel-size');
    query.node.resolve = () => ({
      __typename: 'MediaImage',
      id: 'media-1',
      image: { id: 'image-1' },
    });
    (schema.getType('Image') as GraphQLObjectType).getFields().url.resolve = (
      _,
      { transform }
    ) => {
      expect(transform).toMatchObject({
        fit: 'CONTAIN',
        quality: 80,
        preferredContentType: 'AVIF',
      });
      return 'https://example.test/image.avif';
    };
    expect(
      (
        await api.loadImage({
          id: 'media-1',
          transform: {
            fit: 'CONTAIN',
            quality: 80,
            preferredContentType: 'AVIF',
          },
        })
      )?.url
    ).toBe('https://example.test/image.avif');
  });
  it('fetches subsequent collection pages and isolates filtered listings in the cache', async () => {
    const { api, query, schema } = setup();
    query.collection.resolve = () => ({ id: 'collection-1' });
    const products = vi.fn(
      (_: unknown, args: { after?: string; query?: string }) => {
        const id = args.query
          ? 'filtered'
          : args.after
            ? 'product-2'
            : 'product-1';
        return {
          edges: [{ cursor: id, node: { id, handle: id, title: id } }],
          pageInfo: {
            hasNextPage: !args.after,
            hasPreviousPage: Boolean(args.after),
            startCursor: id,
            endCursor: id,
          },
          totalCount: 2,
          sort: 'NEWEST',
          availableSorts: ['NEWEST'],
          filters: [],
        };
      }
    );
    (
      schema.getType('Collection') as GraphQLObjectType
    ).getFields().products.resolve = products;
    await api.loadCollectionProducts({ id: 'collection-1', first: 1 });
    const second = await api.loadCollectionProducts({
      id: 'collection-1',
      first: 1,
      after: 'product-1',
    });
    expect(products).toHaveBeenCalledTimes(2);
    expect(second?.edges.map(({ node }) => node.id)).toEqual([
      'product-1',
      'product-2',
    ]);
    const filtered = await api.loadCollectionProducts({
      id: 'collection-1',
      first: 1,
      query: 'filtered',
    });
    expect(filtered?.edges.map(({ node }) => node.id)).toEqual(['filtered']);
  });
});
