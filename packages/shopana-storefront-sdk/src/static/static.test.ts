import { ApolloClient, ApolloLink, Observable } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { createApolloCache } from '../graphql/apollo/cache';
import { enumerateStaticRoutes } from './enumerate';
import { indexStaticPage } from './entities';
import { staticRenderHeaders, staticRenderMode } from './render';

vi.mock('@apollo/client-integration-nextjs', async () => {
  const { InMemoryCache } = await import('@apollo/client');
  return { InMemoryCache };
});

/** A client whose API answers by operation name. */
function clientOf(
  answer: (operation: string, variables: Record<string, unknown>) => unknown
) {
  const calls: string[] = [];
  const client = new ApolloClient({
    cache: createApolloCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          calls.push(operation.operationName ?? '');
          observer.next({
            data: answer(
              operation.operationName ?? '',
              operation.variables
            ) as Record<string, unknown>,
          });
          observer.complete();
        })
    ),
  });
  return { client, calls };
}

const page = (typename: string, handles: string[], next: string | null) => ({
  __typename: `${typename}Connection`,
  pageInfo: {
    __typename: 'PageInfo',
    hasNextPage: next !== null,
    endCursor: next,
  },
  nodes: handles.map((handle) => ({
    __typename: typename,
    id: `${typename}-${handle}`,
    handle,
  })),
});

describe('static site addresses', () => {
  it('walks the lists of the config, page after page', async () => {
    const { client } = clientOf((operation, variables) => {
      switch (operation) {
        case 'SdkStaticProducts':
          return {
            products: variables.after
              ? page('Product', ['hat'], null)
              : page('Product', ['sock'], 'c1'),
          };
        case 'SdkStaticStorePolicies':
          return {
            store: {
              __typename: 'Store',
              id: 's',
              policies: [
                { __typename: 'StorePolicy', id: 'p', handle: 'refund-policy' },
              ],
            },
          };
        case 'SdkStaticNavigationMenu':
          return {
            onlineStoreNavigationMenuByHandle: {
              __typename: 'OnlineStoreNavigationMenu',
              id: 'm',
              items: [
                {
                  __typename: 'OnlineStoreNavigationMenuItem',
                  id: 'i1',
                  target: {
                    __typename: 'OnlineStoreNavigationTarget',
                    type: 'COLLECTION',
                    url: null,
                    resource: {
                      __typename: 'Collection',
                      id: 'c',
                      handle: 'summer',
                    },
                  },
                  children: [
                    {
                      __typename: 'OnlineStoreNavigationMenuItem',
                      id: 'i2',
                      target: {
                        __typename: 'OnlineStoreNavigationTarget',
                        type: 'URL',
                        url: '/c/winter?sort=new',
                        resource: null,
                      },
                      children: [],
                    },
                    {
                      __typename: 'OnlineStoreNavigationMenuItem',
                      id: 'i3',
                      target: {
                        __typename: 'OnlineStoreNavigationTarget',
                        type: 'URL',
                        url: '/en/collections/autumn',
                        resource: null,
                      },
                      children: [],
                    },
                    {
                      __typename: 'OnlineStoreNavigationMenuItem',
                      id: 'i4',
                      target: {
                        __typename: 'OnlineStoreNavigationTarget',
                        type: 'URL',
                        url: '/en/products/sock',
                        resource: null,
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
          };
        default:
          throw new Error(operation);
      }
    });
    const routes = await enumerateStaticRoutes(
      {
        pages: {
          home: true,
          product: { enumerate: 'products' },
          policies: { enumerate: 'store.policies' },
          collection: { enumerate: 'menus' },
          blog: { enumerate: () => ['/blogs/news'] },
        },
        extraCollections: ['sale', 'summer'],
      },
      {
        client,
        locale: { code: 'en', tag: 'en', segment: 'en', name: 'English' },
        navigationMenus: ['main'],
      }
    );
    expect(routes.map((route) => route.path)).toEqual([
      '/',
      '/products/sock',
      '/products/hat',
      '/policies/refund-policy',
      '/collections/summer',
      '/collections/winter',
      '/collections/autumn',
      '/collections/sale',
      '/blogs/news',
    ]);
  });

  it('fails on a list that never ends', async () => {
    let cursor = 0;
    const { client } = clientOf(() => {
      cursor += 1;
      return { products: page('Product', [`p${cursor}`], `c${cursor}`) };
    });
    await expect(
      enumerateStaticRoutes(
        { pages: { product: { enumerate: 'products' } } },
        {
          client,
          locale: { code: 'en', tag: 'en', segment: 'en', name: 'English' },
          navigationMenus: [],
        }
      )
    ).rejects.toThrow(/more than/);
  });
});

describe('the index of a static page', () => {
  it('finds its next moment of change, of a promotion too', () => {
    const index = indexStaticPage(
      {
        'Product:{"handle":"sock"}': {
          __typename: 'Product',
          id: 'p1',
          variants: [
            { __typename: 'ProductVariant', id: 'v1', price: { amount: 1 } },
          ],
        },
        'StorefrontPromotion:x': {
          __typename: 'StorefrontPromotion',
          id: 'x',
          startsAt: '2026-11-01T00:00:00Z',
          endsAt: '2026-11-08T00:00:00Z',
        },
        'Collection:c1': {
          __typename: 'Collection',
          id: 'c1',
          activeTo: '2026-11-07T00:00:00Z',
        },
        ROOT_QUERY: {
          'storefrontPromotions({"kinds":null})': {
            validUntil: '2026-11-06T12:00:00Z',
          },
        },
      },
      new Date('2026-11-06T00:00:00Z')
    );
    // The promotions are in the page: the set of the store changes first.
    expect(index).toEqual({ validUntil: '2026-11-06T12:00:00.000Z' });
  });

  it('reads whole responses too, and knows no moment of the past', () => {
    expect(
      indexStaticPage(
        [
          {
            o: 'Q',
            d: {
              collection: {
                __typename: 'Collection',
                id: 'c',
                activeFrom: '2026-11-05T00:00:00Z',
                activeTo: '2026-11-09T00:00:00Z',
              },
            },
          },
        ],
        new Date('2026-11-06T00:00:00Z')
      )
    ).toEqual({ validUntil: '2026-11-09T00:00:00.000Z' });
  });
});

describe('the static render of this process', () => {
  it('is known by the key of the process only', () => {
    const headers = new Headers(staticRenderHeaders('page'));
    expect(staticRenderMode(headers)).toBe('page');
    headers.set('x-shopana-static-render-key', 'guessed');
    expect(staticRenderMode(headers)).toBeNull();
    expect(
      staticRenderMode(new Headers({ 'x-shopana-static-render': 'page' }))
    ).toBeNull();
  });
});
