import { ApolloClient, ApolloLink, Observable } from '@apollo/client';
import { parse } from 'graphql';
import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addApolloCacheState,
  createApolloCache,
} from '../graphql/apollo/cache';
import { enumerateStaticRoutes } from './enumerate';
import { indexStaticPage } from './entities';
import { useValidUntilRefetch } from './useValidUntilRefetch';
import { refetchViewerQueries, stripViewerFields } from './viewer';

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

describe('a refetch at validUntil', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires once at the moment, again only for a new one, and not after unmount', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-06T00:00:00Z') });
    const refetch = vi.fn();
    const { rerender, unmount } = renderHook(
      // A new callback each render: only a new moment starts a new timer.
      ({ at }) => useValidUntilRefetch(at, () => refetch()),
      { initialProps: { at: '2026-11-06T00:00:10Z' } }
    );
    vi.advanceTimersByTime(9_999);
    rerender({ at: '2026-11-06T00:00:10Z' });
    await Promise.resolve();
    expect(refetch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    await vi.waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    rerender({ at: '2026-11-06T00:00:20Z' });
    unmount();
    vi.advanceTimersByTime(60_000);
    await Promise.resolve();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('waits a moment further than setTimeout reaches in steps, and a past one fires at once', async () => {
    vi.useFakeTimers({ now: new Date('2026-11-06T00:00:00Z') });
    const refetch = vi.fn();
    renderHook(() => useValidUntilRefetch('2027-06-01T00:00:00Z', refetch));
    vi.advanceTimersByTime(2_147_483_647);
    await Promise.resolve();
    expect(refetch).not.toHaveBeenCalled();
    vi.setSystemTime(new Date('2027-06-01T00:00:00Z'));
    vi.advanceTimersByTime(2_147_483_647);
    await vi.waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));

    const past = vi.fn();
    renderHook(() => useValidUntilRefetch('2020-01-01T00:00:00Z', past));
    vi.advanceTimersByTime(0);
    await vi.waitFor(() => expect(past).toHaveBeenCalledTimes(1));
  });
});

describe('the index of a static page', () => {
  it('lists its entities and its next moment of change', () => {
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
        ROOT_QUERY: {
          'storefrontPromotions({"kinds":null})': {
            validUntil: '2026-11-07T00:00:00Z',
          },
        },
      },
      new Date('2026-11-06T00:00:00Z')
    );
    expect(index).toEqual({
      entities: ['Product:p1', 'ProductVariant:v1', 'StorefrontPromotion:x'],
      validUntil: '2026-11-07T00:00:00.000Z',
    });
  });

  it('reads whole responses too', () => {
    expect(
      indexStaticPage(
        [{ o: 'Q', d: { vendorByHandle: { __typename: 'Vendor', id: 'v' } } }],
        new Date()
      ).entities
    ).toEqual(['Vendor:v']);
  });
});

describe("the viewer's fields", () => {
  it('leaves them out of a static state', () => {
    expect(
      stripViewerFields({
        'Review:1': {
          __typename: 'Review',
          id: '1',
          viewerEngagement: { vote: 'LIKE' },
          rating: 5,
        },
        'ProductVariant:v': {
          __typename: 'ProductVariant',
          id: 'v',
          loyalty: {},
          sku: 's',
        },
      })
    ).toEqual({
      'Review:1': { __typename: 'Review', id: '1', rating: 5 },
      'ProductVariant:v': { __typename: 'ProductVariant', id: 'v', sku: 's' },
    });
    expect(
      stripViewerFields([
        {
          o: 'Q',
          d: {
            product: {
              __typename: 'Product',
              id: 'p',
              loyalty: { x: 1 },
              title: 't',
            },
          },
        },
      ])
    ).toEqual([
      {
        o: 'Q',
        d: { product: { __typename: 'Product', id: 'p', title: 't' } },
      },
    ]);
  });

  it('asks again only the queries that show them', async () => {
    const { client, calls } = clientOf((operation) =>
      operation === 'Loyalty'
        ? {
            product: {
              __typename: 'Product',
              id: 'p',
              loyalty: {
                __typename: 'ProductLoyaltyPresentation',
                revision: 1,
              },
            },
          }
        : { store: { __typename: 'Store', id: 's', name: 'Shop' } }
    );
    const watch = (query: string) =>
      client.watchQuery({ query: parse(query) }).subscribe(() => {});
    const a = watch('query Loyalty { product { id loyalty { revision } } }');
    const b = watch('query Store { store { id name } }');
    await vi.waitFor(() => expect(calls).toHaveLength(2));
    expect(await refetchViewerQueries(client)).toBe(1);
    expect(calls).toEqual(['Loyalty', 'Store', 'Loyalty']);
    a.unsubscribe();
    b.unsubscribe();
  });
});

describe('the static data of a page in the browser cache', () => {
  it('merges a normalized state and waits whole responses for their queries', () => {
    const cache = createApolloCache();
    cache.restore({ 'Store:s': { __typename: 'Store', id: 's', name: 'Old' } });
    addApolloCacheState(cache, {
      'Store:s': { __typename: 'Store', id: 's', currency: 'UAH' },
    });
    expect(cache.extract()['Store:s']).toEqual({
      __typename: 'Store',
      id: 's',
      name: 'Old',
      currency: 'UAH',
    });

    const query = parse('query Shop { store { __typename id name } }');
    addApolloCacheState(cache, [
      {
        o: 'Shop',
        d: { store: { __typename: 'Store', id: 's', name: 'New' } },
      },
    ]);
    expect(cache.readQuery({ query })).toEqual({
      store: { __typename: 'Store', id: 's', name: 'New' },
    });
  });
});
