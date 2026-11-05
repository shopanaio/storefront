// @vitest-environment node
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { parse } from 'graphql';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApolloCache } from './cache';
import { RequestResultCache } from './requestResultCache';

const PRODUCT = parse(`
  query Product($handle: String!) {
    productByHandle(handle: $handle) { __typename id handle title }
  }
`);
const data = {
  productByHandle: { __typename: 'Product', id: '1', handle: 'a', title: 'A' },
};
const variables = { handle: 'a' };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('RequestResultCache', () => {
  it('answers a query once, from its own response, and carries it to the browser', async () => {
    const request = vi.fn(
      () =>
        new Observable<ApolloLink.Result>((observer) => {
          observer.next({ data });
          observer.complete();
        })
    );
    const cache = new RequestResultCache();
    const client = new ApolloClient({ cache, link: new ApolloLink(request) });

    expect((await client.query({ query: PRODUCT, variables })).data).toEqual(
      data
    );
    expect((await client.query({ query: PRODUCT, variables })).data).toEqual(
      data
    );

    expect(request).toHaveBeenCalledTimes(1);
    expect(cache.results()).toEqual([{ o: 'Product', v: variables, d: data }]);
  });

  it('misses a query of other variables', () => {
    const cache = new RequestResultCache();
    cache.write({ query: PRODUCT, variables, result: data });
    expect(
      cache.diff({
        query: PRODUCT,
        variables: { handle: 'b' },
        optimistic: false,
      }).complete
    ).toBe(false);
  });
});

describe('the browser side of the results', () => {
  const results = [{ o: 'Product', v: variables, d: data }];

  it('writes a response when its query first reads, with its handle indexed', () => {
    const cache = createApolloCache({}, InMemoryCache, results);
    expect(cache.extract()).toEqual({});

    const diff = cache.diff({ query: PRODUCT, variables, optimistic: false });

    expect(diff.complete).toBe(true);
    expect(diff.result).toEqual(data);
    expect(cache.extract()).toHaveProperty(
      ['Product:{"id":"1"}', 'title'],
      'A'
    );
    // The handle index answers a query that never ran, from what the response wrote.
    expect(
      cache.diff({
        query: PRODUCT,
        variables: { handle: 'a', other: true },
        optimistic: false,
      }).complete
    ).toBe(true);
  });

  it('does not overwrite a newer answer of the query, nor survive a reset', async () => {
    const newer = {
      productByHandle: { ...data.productByHandle, title: 'B' },
    };
    const written = createApolloCache({}, InMemoryCache, results);
    written.write({
      dataId: 'ROOT_QUERY',
      query: PRODUCT,
      variables,
      result: newer,
    });
    expect(
      written.diff({ query: PRODUCT, variables, optimistic: false }).result
    ).toEqual(newer);

    const reset = createApolloCache({}, InMemoryCache, results);
    await reset.reset();
    expect(
      reset.diff({ query: PRODUCT, variables, optimistic: false }).complete
    ).toBe(false);
  });
});

describe('the server cache of a client', () => {
  const load = async (value?: string) => {
    if (value) vi.stubEnv('STOREFRONT_APOLLO_CLIENT_NORMALIZATION', value);
    vi.resetModules();
    const { createApolloClient } = await import('./Environment');
    return createApolloClient({
      graphqlUrl: 'https://api.example.test/graphql',
      apiKeyHeader: 'x-key',
      apiKey: 'key',
    }).cache;
  };

  it('normalizes without remembering results when the switch is off', async () => {
    const cache = (await load()) as unknown as {
      config: { resultCaching: boolean };
    };
    expect(cache.config.resultCaching).toBe(false);
    expect(cache.constructor.name).not.toBe('RequestResultCache');
  });

  it('keeps whole responses when the switch is on', async () => {
    expect((await load('1')).constructor.name).toBe('RequestResultCache');
  });
});
