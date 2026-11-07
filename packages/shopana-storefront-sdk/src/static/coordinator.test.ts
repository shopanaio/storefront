import { describe, expect, it, vi } from 'vitest';
import {
  ALL_STATIC_ASPECTS,
  aspectNames,
  STATIC_ASPECTS,
} from '../graphql/apollo/fieldAspects';
import { extractPageDeps, STATIC_DEP_KINDS } from './deps';
import { indexStaticPage } from './entities';
import {
  createEventFeedClient,
  EventFeedError,
  refreshTokenSource,
} from './eventFeed';
import { mapEventToChanges, STATIC_EVENT_TOPICS } from './events';
import {
  CORRECTABLE_FIELDS,
  findVolatileFields,
  stripVolatileFields,
  VOLATILE_FIELDS,
} from './fieldClasses';
import { decodeGlobalId, entityKey } from './globalId';
import { VIEWER_FIELDS } from './viewer';

const uuidA = '0196a1b2-0000-7000-8000-00000000000a';
const uuidB = '0196a1b2-0000-7000-8000-00000000000b';
const uuidC = '0196a1b2-0000-7000-8000-00000000000c';
const gidOf = (type: string, id: string) =>
  Buffer.from(`gid://shopana/${type}/${id}`).toString('base64url');

/** A normalized state of a category page: two products, one in breadcrumbs only. */
function categoryState() {
  return {
    ROOT_QUERY: {
      __typename: 'Query',
      'categoryByHandle({"handle":"chips"})': {
        __ref: `Category:{"id":"${gidOf('Category', uuidC)}"}`,
      },
      store: { __ref: 'Store:{"id":"store"}' },
      'onlineStoreNavigationMenuByHandle({"handle":"main"})': {
        __ref: 'OnlineStoreNavigationMenu:{"id":"menu"}',
      },
      'storefrontPromotions({})': {
        __typename: 'StorefrontPromotionPresentation',
        validUntil: '2030-01-01T00:00:00Z',
        promotions: [],
      },
    },
    'Store:{"id":"store"}': { __typename: 'Store', id: 'store', name: 'Shop' },
    'OnlineStoreNavigationMenu:{"id":"menu"}': {
      __typename: 'OnlineStoreNavigationMenu',
      id: 'menu',
      items: [{ __ref: `Category:{"id":"menu-cat"}` }],
    },
    'Category:{"id":"menu-cat"}': {
      __typename: 'Category',
      id: 'menu-cat',
      title: 'Menu',
    },
    [`Category:{"id":"${gidOf('Category', uuidC)}"}`]: {
      __typename: 'Category',
      id: gidOf('Category', uuidC),
      title: 'Chips',
      'products({"first":40})': {
        __typename: 'ProductConnection',
        edges: [
          {
            __typename: 'ProductEdge',
            node: { __ref: `Product:{"id":"${gidOf('Product', uuidA)}"}` },
          },
        ],
      },
      breadcrumbs: [{ __ref: `Product:{"id":"${gidOf('Product', uuidB)}"}` }],
    },
    [`Product:{"id":"${gidOf('Product', uuidA)}"}`]: {
      __typename: 'Product',
      id: gidOf('Product', uuidA),
      title: 'Apple chips',
      featuredImage: { __typename: 'MediaImage', url: 'x' },
      selectedOrFirstAvailableVariant: {
        __ref: 'ProductVariant:{"id":"v1"}',
      },
    },
    'ProductVariant:{"id":"v1"}': {
      __typename: 'ProductVariant',
      id: 'v1',
      price: { __typename: 'Money', amount: '1' },
      availableForSale: true,
      quantityAvailable: 5,
      promotions: { __typename: 'StorefrontPromotionPresentation' },
    },
    [`Product:{"id":"${gidOf('Product', uuidB)}"}`]: {
      __typename: 'Product',
      id: gidOf('Product', uuidB),
      title: 'Crumb',
    },
  };
}

describe('field classes', () => {
  it('do not intersect', () => {
    const tables = { VOLATILE_FIELDS, CORRECTABLE_FIELDS, VIEWER_FIELDS };
    const seen = new Map<string, string>();
    for (const [name, table] of Object.entries(tables)) {
      for (const [typename, fields] of Object.entries(table)) {
        for (const field of fields) {
          const id = `${typename}.${field}`;
          expect(seen.get(id), id).toBeUndefined();
          seen.set(id, name);
        }
      }
    }
  });

  it('strips volatile fields of a normalized state and its orphans', () => {
    const state = {
      ROOT_QUERY: {
        __typename: 'Query',
        'storefrontPromotions({})': { __ref: 'Presentation:1' },
        product: { __ref: 'ProductVariant:v1' },
      },
      'Presentation:1': {
        __typename: 'StorefrontPromotionPresentation',
        id: '1',
      },
      'ProductVariant:v1': {
        __typename: 'ProductVariant',
        id: 'v1',
        quantityAvailable: 3,
        promotions: { __ref: 'Presentation:2' },
        price: 1,
      },
      'Presentation:2': {
        __typename: 'StorefrontPromotionPresentation',
        id: '2',
      },
    };
    expect(findVolatileFields(state)).toEqual([
      'ProductVariant.promotions',
      'ProductVariant.quantityAvailable',
      'Query.storefrontPromotions',
    ]);
    const stripped = stripVolatileFields(state);
    expect(stripped).toEqual({
      ROOT_QUERY: {
        __typename: 'Query',
        product: { __ref: 'ProductVariant:v1' },
      },
      'ProductVariant:v1': { __typename: 'ProductVariant', id: 'v1', price: 1 },
    });
    expect(findVolatileFields(stripped)).toEqual([]);
  });

  it('strips volatile fields of whole responses', () => {
    const state = [
      {
        o: 'Page',
        d: {
          storefrontPromotions: { validUntil: null },
          node: {
            __typename: 'ProductVariant',
            id: 'v',
            quantityAvailable: 1,
            sku: 'x',
          },
        },
      },
    ];
    expect(stripVolatileFields(state)).toEqual([
      {
        o: 'Page',
        d: { node: { __typename: 'ProductVariant', id: 'v', sku: 'x' } },
      },
    ]);
  });
});

describe('global ids', () => {
  it('decodes every form to one key', () => {
    expect(decodeGlobalId(`gid://shopana/Product/${uuidA}`)).toEqual({
      typename: 'Product',
      id: uuidA,
    });
    expect(entityKey('Product', gidOf('Product', uuidA))).toBe(
      `Product:${uuidA}`
    );
    expect(
      entityKey(
        undefined,
        Buffer.from(`Product:${uuidA}`).toString('base64url')
      )
    ).toBe(`Product:${uuidA}`);
    expect(entityKey('Product', uuidA)).toBe(`Product:${uuidA}`);
    expect(decodeGlobalId('plain')).toBeNull();
  });
});

describe('extractPageDeps', () => {
  it('reads entities, lists, aspects and the owner of a normalized state', () => {
    const { deps, layout, owner } = extractPageDeps(categoryState());
    const byKey = Object.fromEntries(deps.map((dep) => [dep.key, dep]));
    expect(owner).toBe(`Category:${uuidC}`);
    // The product of the card: its variant's price and stock count for it.
    expect(aspectNames(byKey[`Product:${uuidA}`].aspects)).toEqual([
      'content',
      'pricing',
      'availability',
      'media',
    ]);
    // The product in breadcrumbs: its title only.
    expect(aspectNames(byKey[`Product:${uuidB}`].aspects)).toEqual(['content']);
    expect(byKey[`Category:${uuidC}#products`]).toEqual({
      key: `Category:${uuidC}#products`,
      kind: STATIC_DEP_KINDS.list,
      aspects:
        STATIC_ASPECTS.membership |
        STATIC_ASPECTS.pricing |
        STATIC_ASPECTS.availability,
    });
    // Volatile fields give no dependency, layout objects none either.
    expect(deps.some((dep) => dep.key.startsWith('Store'))).toBe(false);
    expect(deps.some((dep) => dep.key.includes('Promotion'))).toBe(false);
    expect(layout).toEqual([
      'Category:menu-cat',
      'OnlineStoreNavigationMenu:menu',
      'Store:store',
    ]);
  });

  it('reads whole responses the same way', () => {
    const state = [
      {
        o: 'ProductPage',
        d: {
          productByHandle: {
            __typename: 'Product',
            id: uuidA,
            title: 'A',
            reviewSummary: { __typename: 'ReviewSummary', average: 4 },
            relatedProducts: {
              __typename: 'ProductConnection',
              nodes: [{ __typename: 'Product', id: uuidB, title: 'B' }],
            },
          },
        },
      },
      {
        o: 'Search',
        d: {
          products: {
            __typename: 'ProductConnection',
            nodes: [
              { __typename: 'Product', id: uuidC, availableForSale: true },
            ],
          },
          dynamicCollection: {
            __typename: 'DynamicCollection',
            products: { nodes: [{ __typename: 'Product', id: uuidB }] },
          },
        },
      },
    ];
    const { deps, owner } = extractPageDeps(state, { translated: true });
    const byKey = Object.fromEntries(deps.map((dep) => [dep.key, dep]));
    expect(owner).toBe(`Product:${uuidA}`);
    expect(aspectNames(byKey[`Product:${uuidA}`].aspects)).toEqual([
      'content',
      'reviews',
      'translation',
    ]);
    expect(byKey[`Product:${uuidA}#relatedProducts`].kind).toBe(
      STATIC_DEP_KINDS.list
    );
    expect(byKey['Query#products']).toEqual({
      key: 'Query#products',
      kind: STATIC_DEP_KINDS.query,
      aspects: STATIC_ASPECTS.membership | STATIC_ASPECTS.availability,
    });
    expect(byKey['Query#dynamicCollection'].kind).toBe(STATIC_DEP_KINDS.query);
  });

  it('takes the aspects of a theme', () => {
    const { deps } = extractPageDeps(
      [
        {
          o: 'P',
          d: {
            productByHandle: { __typename: 'Product', id: uuidA, badge: 'x' },
          },
        },
      ],
      { fieldAspects: { Product: { badge: 'media' } } }
    );
    expect(aspectNames(deps[0].aspects)).toEqual(['media']);
  });
});

describe('indexStaticPage', () => {
  it('sees no moment of a promotion', () => {
    const index = indexStaticPage(categoryState(), new Date('2026-01-01'));
    expect(index.validUntil).toBeNull();
    expect(index.entities.some((key) => key.includes('Promotion'))).toBe(false);
  });
});

describe('mapEventToChanges', () => {
  const event = (topic: string, data: Record<string, unknown> = {}) =>
    mapEventToChanges({ id: 'e1', topic, data });

  it('has a rule for every topic', () => {
    for (const topic of STATIC_EVENT_TOPICS) {
      const changes = event(topic, {
        id: gidOf('Product', uuidA),
        productId: gidOf('Product', uuidA),
        resourceId: gidOf('Product', uuidA),
      });
      expect(changes.length, topic).toBeGreaterThan(0);
    }
    expect(event('orderCreated')).toEqual([]);
  });

  it('renders the own page of a product and its lists on pricing', () => {
    const changes = event('productUpdated', {
      productId: gidOf('Product', uuidA),
      reasons: ['pricing'],
      affectedCategoryIds: [gidOf('Category', uuidC)],
    });
    expect(changes[0]).toEqual({
      key: `Product:${uuidA}`,
      kinds: [STATIC_DEP_KINDS.entity],
      aspects: STATIC_ASPECTS.pricing,
      own: { route: 'product', owner: `Product:${uuidA}` },
      purgeTags: [`sf-p-${uuidA}`],
    });
    expect(changes.map((change) => change.key)).toContain(
      `Category:${uuidC}#products`
    );
  });

  it('only marks stock stale and never touches content-only pages', () => {
    const [own, ...lists] = event('productUpdated', {
      productId: uuidA,
      reasons: ['inventory'],
    });
    expect(own.lazy).toBe(true);
    expect(own.own).toBeUndefined();
    expect(own.aspects & STATIC_ASPECTS.content).toBe(0);
    expect(own.aspects).toBe(STATIC_ASPECTS.availability);
    expect(lists.every((change) => change.lazy)).toBe(true);
  });

  it('renders no page for a discount, only purges', () => {
    expect(event('discountUpdated', { id: 'd' })).toEqual([
      { key: '', kinds: [], aspects: 0, purgeTags: ['sf-promo', 'sf-vol'] },
    ]);
  });

  it('builds everything for menus and the store', () => {
    expect(event('navigationMenuUpdated')[0].full).toBe(true);
    expect(event('storeLocalesUpdated')[0].full).toBe(true);
  });

  it('takes the own page of a deleted product away', () => {
    const [change] = event('productDeleted', { productId: uuidA });
    expect(change.gone).toBe(true);
    expect(change.aspects).toBe(ALL_STATIC_ASPECTS);
  });

  it('limits translations to their languages', () => {
    expect(
      event('resourceTranslationsUpdated', {
        resourceId: gidOf('Category', uuidC),
        locales: ['uk'],
      })
    ).toEqual([
      {
        key: `Category:${uuidC}`,
        kinds: [STATIC_DEP_KINDS.entity],
        aspects: STATIC_ASPECTS.translation,
        locales: ['uk'],
      },
    ]);
  });
});

describe('event feed client', () => {
  const token = () =>
    refreshTokenSource({
      tokenUrl: 'https://iam/token',
      refreshToken: 'r1',
      fetch: async () =>
        Response.json({
          access_token: 'a1',
          expires_in: 3600,
          refresh_token: 'r2',
        }),
    });

  it('reads pages of events with the store and the token', async () => {
    const calls: RequestInit[] = [];
    const client = createEventFeedClient({
      adminGraphqlUrl: 'https://admin/graphql',
      storeName: 'shop',
      topics: ['productUpdated'],
      auth: token(),
      fetch: async (url, init) => {
        if (String(url).includes('iam')) {
          return Response.json({ access_token: 'a1', expires_in: 3600 });
        }
        calls.push(init!);
        return Response.json({
          data: {
            webhooksQuery: {
              eventFeed: {
                entries: [
                  {
                    cursor: 'c2',
                    topic: 'productUpdated',
                    eventId: 'e1',
                    envelope: JSON.stringify({
                      topic: 'productUpdated',
                      data: {},
                    }),
                  },
                ],
                nextCursor: 'c2',
                hasMore: false,
                userErrors: [],
              },
            },
          },
        });
      },
    });
    const page = await client.read('c1');
    expect(page.entries[0].envelope).toEqual({
      id: 'e1',
      topic: 'productUpdated',
      data: {},
    });
    const headers = calls[0].headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer a1');
    expect(headers['x-store-name']).toBe('shop');
    expect(JSON.parse(String(calls[0].body)).variables).toMatchObject({
      topics: ['productUpdated'],
      after: 'c1',
      first: 100,
    });
  });

  it('raises the code of a user error', async () => {
    const client = createEventFeedClient({
      adminGraphqlUrl: 'https://admin/graphql',
      storeName: 'shop',
      topics: ['productUpdated'],
      auth: { token: async () => 't', invalidate: () => {} },
      fetch: async () =>
        Response.json({
          data: {
            webhooksQuery: {
              eventFeed: {
                entries: [],
                nextCursor: 'c',
                hasMore: false,
                userErrors: [{ code: 'CURSOR_EXPIRED', message: 'old' }],
              },
            },
          },
        }),
    });
    await expect(client.read('c')).rejects.toMatchObject({
      code: 'CURSOR_EXPIRED',
    });
    await expect(client.read('c')).rejects.toBeInstanceOf(EventFeedError);
  });

  it('renews the token before it expires and keeps a rotated refresh token', async () => {
    let now = 0;
    const kept = vi.fn();
    const fetchToken = vi.fn(async (_url: string | URL, init?: RequestInit) =>
      Response.json({
        access_token: `a-${String(init?.body).includes('r1') ? 1 : 2}`,
        expires_in: 120,
        refresh_token: 'r2',
      })
    );
    const source = refreshTokenSource({
      tokenUrl: 'https://iam/token',
      refreshToken: 'r1',
      fetch: fetchToken,
      now: () => now,
      onRefreshToken: kept,
    });
    expect(await source.token()).toBe('a-1');
    expect(await source.token()).toBe('a-1');
    now = 61_000;
    expect(await source.token()).toBe('a-2');
    expect(fetchToken).toHaveBeenCalledTimes(2);
    expect(kept).toHaveBeenCalledWith('r2');
  });
});
