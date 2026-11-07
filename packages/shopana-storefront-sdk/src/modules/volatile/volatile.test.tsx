import { ApolloClient, ApolloLink, Observable } from '@apollo/client';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { render, renderHook, waitFor } from '@testing-library/react';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createApolloCache } from '../../graphql/apollo/cache';
import {
  canonicalJson,
  createPersistedGetLink,
  persistedDocumentId,
  persistedDocumentOf,
  VIEWER_CONTEXT,
} from '../../graphql/apollo/persisted';
import {
  SdkVolatileCardsDocument,
  SdkVolatileVariantDocument,
} from '../../graphql/apollo/generated/operations';
import { refetchViewerQueries } from '../../static/viewer';
import { VolatileBatcher, VOLATILE_TTL_MS } from './core/VolatileBatcher';
import { VolatileDataProvider } from './react/VolatileDataProvider';
import { useVolatileVariant } from './react/useVolatile';

vi.mock('@apollo/client-integration-nextjs', async () => {
  const { InMemoryCache } = await import('@apollo/client');
  return { InMemoryCache };
});

/** An observable of one answer. */
const answer = (result: Record<string, unknown>) =>
  new Observable<ApolloLink.Result>((observer) => {
    observer.next(result as ApolloLink.Result);
    observer.complete();
  });

interface Call {
  operation: string;
  variables: Record<string, unknown>;
  viewer: boolean;
}

/** A client whose API answers the light queries. */
function apiClient(
  validUntil: string | null = null,
  calls: Call[] = []
): ApolloClient {
  return new ApolloClient({
    cache: createApolloCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const variables = operation.variables as Record<string, unknown>;
          calls.push({
            operation: operation.operationName ?? '',
            variables,
            viewer: Boolean(operation.getContext()[VIEWER_CONTEXT]),
          });
          const variant = (id: string) => ({
            __typename: 'ProductVariant',
            id,
            availableForSale: true,
            currentlyNotInStock: false,
            quantityAvailable: 7,
            product: { __typename: 'Product', id: 'p', availableForSale: true },
            promotions: {
              __typename: 'StorefrontPromotionPresentation',
              validUntil,
              revision: 'r',
              promotions: [{ __typename: 'StorefrontPromotion', key: 'k1' }],
            },
          });
          const data: Record<string, unknown> =
            operation.operationName === 'SdkVolatileVariant'
              ? {
                  variant: variant(variables.id as string),
                  siblings: [],
                }
              : operation.operationName === 'SdkStorefrontPromotions'
                ? { storefrontPromotions: null }
                : {
                    nodes: (variables.ids as string[]).map((id) => ({
                      __typename: 'ProductVariant',
                      id,
                      availableForSale: true,
                      product: { __typename: 'Product', id: 'p' },
                      loyalty: null,
                    })),
                  };
          observer.next({ data });
          observer.complete();
        })
    ),
  });
}

/** A batcher whose frames and timers run when the test says. */
function testBatcher(client: ApolloClient, now = { value: 0 }) {
  const frames: Array<() => void> = [];
  const timers: Array<{ run: () => void; delay: number }> = [];
  const batcher = new VolatileBatcher(client, {
    withPrice: false,
    now: () => now.value,
    schedule: (flush) => frames.push(flush),
    setTimer: (run, delay) => {
      const timer = { run, delay };
      timers.push(timer);
      return timer;
    },
    clearTimer: (timer) => {
      const index = timers.indexOf(timer as (typeof timers)[number]);
      if (index >= 0) timers.splice(index, 1);
    },
  });
  const frame = async () => {
    const pending = frames.splice(0);
    for (const flush of pending) flush();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  return { batcher, frame, timers, frames };
}

describe('the batch of fast data', () => {
  it('asks once a frame, sorted, by 100, and not again within 30 s', async () => {
    const calls: Call[] = [];
    const now = { value: 0 };
    const { batcher, frame } = testBatcher(apiClient(null, calls), now);
    const ids = Array.from(
      { length: 150 },
      (_, index) => `v${String(index).padStart(3, '0')}`
    );
    for (const id of [...ids].reverse()) batcher.registerCard(id);
    await frame();
    const cards = calls.filter((call) => call.operation === 'SdkVolatileCards');
    expect(cards).toHaveLength(2);
    expect(cards[0].variables.ids).toEqual(ids.slice(0, 100));
    expect(cards[1].variables.ids).toEqual(ids.slice(100));
    expect(cards[0].variables.withPrice).toBe(false);
    expect(cards.every((call) => !call.viewer)).toBe(true);

    batcher.visible();
    await frame();
    expect(
      calls.filter((call) => call.operation === 'SdkVolatileCards')
    ).toHaveLength(2);

    now.value = VOLATILE_TTL_MS;
    batcher.registerCard('v999');
    await frame();
    // Every id is due again, the new one with them.
    expect(
      calls.filter((call) => call.operation === 'SdkVolatileCards')
    ).toHaveLength(4);
  });

  it('asks the variant with its siblings, the promotions once, again at validUntil', async () => {
    const calls: Call[] = [];
    const now = { value: Date.parse('2030-01-01T00:00:00Z') };
    const { batcher, frame, timers } = testBatcher(
      apiClient('2030-01-01T00:01:00Z', calls),
      now
    );
    batcher.registerVariant('v2', ['v3', 'v1', 'v2']);
    await frame();
    const variant = calls.find(
      (call) => call.operation === 'SdkVolatileVariant'
    );
    expect(variant?.variables).toEqual({
      id: 'v2',
      siblings: ['v1', 'v3'],
      withPrice: false,
    });
    expect(
      calls.filter((call) => call.operation === 'SdkStorefrontPromotions')
    ).toHaveLength(1);
    expect(timers.map((timer) => timer.delay)).toEqual([60_000]);
    timers[0].run();
    await frame();
    expect(
      calls.filter((call) => call.operation === 'SdkVolatileVariant')
    ).toHaveLength(2);
    expect(
      calls.filter((call) => call.operation === 'SdkStorefrontPromotions')
    ).toHaveLength(1);
  });

  it("asks the viewer's loyalty only with a session, as the viewer", async () => {
    const calls: Call[] = [];
    const { batcher, frame } = testBatcher(apiClient(null, calls));
    batcher.registerCard('v1', 'p1');
    await frame();
    expect(calls.some((call) => call.operation === 'SdkViewerLoyalty')).toBe(
      false
    );
    batcher.setViewer(true);
    await frame();
    const viewer = calls.filter(
      (call) => call.operation === 'SdkViewerLoyalty'
    );
    expect(viewer).toHaveLength(1);
    expect(viewer[0]).toMatchObject({
      variables: { ids: ['p1', 'v1'] },
      viewer: true,
    });
    batcher.registerCard('v2');
    await frame();
    expect(
      calls.filter((call) => call.operation === 'SdkViewerLoyalty').at(-1)
        ?.variables
    ).toEqual({ ids: ['v2'] });
    // Signing out asks the guest's loyalty of everything on screen again.
    batcher.setViewer(false);
    await frame();
    expect(
      calls.filter((call) => call.operation === 'SdkViewerLoyalty').at(-1)
        ?.variables
    ).toEqual({ ids: ['p1', 'v1', 'v2'] });
  });
});

describe('the fast data of a variant', () => {
  it('is not ready on the server nor at hydration, ready after the answer', async () => {
    const client = apiClient();
    const Probe = () => {
      const variant = useVolatileVariant('v1', ['v2']);
      return (
        <span>
          {variant.ready ? `ready ${variant.quantityAvailable}` : 'skeleton'}
        </span>
      );
    };
    const tree = (
      <ApolloProvider client={client}>
        <VolatileDataProvider>
          <Probe />
        </VolatileDataProvider>
      </ApolloProvider>
    );
    expect(renderToString(tree)).toContain('skeleton');
    const view = render(tree);
    expect(view.container.textContent).toBe('skeleton');
    await waitFor(() => expect(view.container.textContent).toBe('ready 7'));
  });
});

describe('the GET link of guest queries', () => {
  it('sends the document id, the locale and sorted variables, never the session', async () => {
    const fetchCalls: Array<{ url: string; init: RequestInit }> = [];
    const link = createPersistedGetLink({
      uri: 'https://shop.test/graphql',
      apiKeyHeader: 'x-api-key',
      apiKey: 'public',
      locale: 'uk',
      fetch: async (url, init) => {
        fetchCalls.push({ url: String(url), init: init! });
        return Response.json({ data: { nodes: [] } });
      },
    });
    const forwarded: string[] = [];
    const client = new ApolloClient({
      cache: createApolloCache(),
      link: ApolloLink.from([
        link,
        new ApolloLink((operation) => {
          forwarded.push(operation.operationName ?? '');
          return answer({ data: { nodes: [] } });
        }),
      ]),
    });
    await client.query({
      query: SdkVolatileCardsDocument,
      variables: { withPrice: false, ids: ['b', 'a'] },
    });
    expect(fetchCalls).toHaveLength(1);
    const url = new URL(fetchCalls[0].url);
    expect(url.pathname).toBe('/graphql');
    expect(url.searchParams.get('locale')).toBe('uk');
    expect(url.searchParams.get('documentId')).toBe(
      await persistedDocumentId(persistedDocumentOf(SdkVolatileCardsDocument))
    );
    expect(url.searchParams.get('variables')).toBe(
      '{"ids":["b","a"],"withPrice":false}'
    );
    const headers = fetchCalls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
    expect(headers['x-shopana-storefront-visitor-id']).toBeUndefined();
    expect(fetchCalls[0].init.credentials).toBe('omit');
    expect(headers['Accept-Language']).toBe('uk');

    // The viewer's queries and the documents of no allow-list go on as before.
    await client.query({
      query: SdkVolatileVariantDocument,
      variables: { id: 'v', siblings: [], withPrice: false },
      context: { [VIEWER_CONTEXT]: true },
      fetchPolicy: 'network-only',
    });
    expect(forwarded).toEqual(['SdkVolatileVariant']);
  });

  it('keys variables canonically', () => {
    expect(
      canonicalJson({ b: 1, a: { d: [2, { f: 1, e: 0 }], c: null } })
    ).toBe('{"a":{"c":null,"d":[2,{"e":0,"f":1}]},"b":1}');
  });
});

describe('the viewer refresh', () => {
  it('does not ask again a query that shows only loyalty', async () => {
    const asked: string[] = [];
    const client = new ApolloClient({
      cache: createApolloCache(),
      link: new ApolloLink((operation) => {
        asked.push(operation.operationName ?? '');
        return answer({
          data: {
            productByHandle: {
              __typename: 'Product',
              id: 'p',
              loyalty: null,
            },
          },
        });
      }),
    });
    const { parse } = await import('graphql');
    const query = parse(
      'query ProductPageQuery { productByHandle(handle: "x") { id loyalty { revision } } }'
    );
    const { result } = renderHook(() => useQuery(query), {
      wrapper: ({ children }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
      ),
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(await refetchViewerQueries(client)).toBe(0);
    expect(asked).toEqual(['ProductPageQuery']);
  });
});
