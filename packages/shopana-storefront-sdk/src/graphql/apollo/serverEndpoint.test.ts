// @vitest-environment node
import { Kind, type DocumentNode, type OperationTypeNode } from 'graphql';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadStorefrontLocales } from '../../modules/localization/server/loadStorefrontLocales';
import { createApolloClient } from './Environment';
import { directGatewayHeaders } from '../../server/directGateway';
import { serverGraphqlUrl } from './serverEndpoint';
import type { ApolloEnvironmentConfig } from './types';

const PUBLIC_URL = 'https://pet.example.test/graphql';
const SERVER_URL = 'http://gateway.internal:4000/graphql';

const config: ApolloEnvironmentConfig = {
  graphqlUrl: PUBLIC_URL,
  apiKeyHeader: 'x-shopana-storefront-access-token',
  apiKey: 'public-test-token',
};

function respondWith(data: unknown) {
  const fetchMock = vi.fn(
    async (_url: string | URL | Request, _init?: RequestInit) =>
      new Response(JSON.stringify({ data }), {
        headers: { 'content-type': 'application/json' },
      })
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('serverGraphqlUrl', () => {
  it('is the public address without the setting', () => {
    expect(serverGraphqlUrl(config)).toBe(PUBLIC_URL);
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', ' ');
    expect(serverGraphqlUrl(config)).toBe(PUBLIC_URL);
  });

  it('is the setting, read at runtime', () => {
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', SERVER_URL);
    expect(serverGraphqlUrl(config)).toBe(SERVER_URL);
  });
});

describe('directGatewayHeaders', () => {
  const incoming = (headers: Record<string, string>) => new Headers(headers);

  it('adds nothing when requests go through the public address', () => {
    expect(
      directGatewayHeaders(incoming({ 'x-forwarded-for': '203.0.113.7' }))
    ).toBeUndefined();
  });

  it('sends the address of the trusted proxy in the form the gateway reads', () => {
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', SERVER_URL);
    const sent = directGatewayHeaders(
      incoming({
        'x-forwarded-for': '198.51.100.66, 203.0.113.7',
        'user-agent': 'Buyer Browser',
      })
    );
    expect(sent).toEqual({
      'x-forwarded-for': '203.0.113.7, storefront-server',
      'user-agent': 'Buyer Browser',
    });
    // The buyer entry stands where the gateway takes it, two hops from the right.
    const chain = sent!['x-forwarded-for']!.split(', ');
    expect(chain[chain.length - 2]).toBe('203.0.113.7');
  });

  it('counts the hops of this server', () => {
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', SERVER_URL);
    vi.stubEnv('STOREFRONT_TRUSTED_PROXY_HOPS', '2');
    expect(
      directGatewayHeaders(
        incoming({ 'x-forwarded-for': '198.51.100.66, 203.0.113.7, 10.0.0.1' })
      )
    ).toEqual({ 'x-forwarded-for': '203.0.113.7, storefront-server' });
  });

  it('claims no address it does not know', () => {
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', SERVER_URL);
    expect(directGatewayHeaders(incoming({}))).toEqual({});
  });
});

describe('server requests', () => {
  const query: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions: [
      {
        kind: Kind.OPERATION_DEFINITION,
        operation: 'query' as OperationTypeNode,
        selectionSet: {
          kind: Kind.SELECTION_SET,
          selections: [
            { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'ping' } },
          ],
        },
      },
    ],
  };

  it('the Apollo client sends them to the server address with the visitor headers', async () => {
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', SERVER_URL);
    const fetchMock = respondWith({ ping: 'pong' });
    const client = createApolloClient(config, {
      gatewayHeaders: { 'x-forwarded-for': '203.0.113.7, storefront-server' },
    });
    await client.query({ query });
    client.stop();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(SERVER_URL);
    expect(new Headers(init?.headers).get('x-forwarded-for')).toBe(
      '203.0.113.7, storefront-server'
    );
  });

  it('the Apollo client keeps the server address out of its cache state', async () => {
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', SERVER_URL);
    respondWith({ ping: 'pong' });
    const client = createApolloClient(config);
    await client.query({ query });
    expect(JSON.stringify(client.extract())).not.toContain('gateway.internal');
    client.stop();
  });

  it('the Apollo client stays on the public address without the setting', async () => {
    const fetchMock = respondWith({ ping: 'pong' });
    const client = createApolloClient(config);
    await client.query({ query });
    client.stop();
    expect(fetchMock.mock.calls[0]![0]).toBe(PUBLIC_URL);
  });

  it('the store languages go to the server address', async () => {
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', SERVER_URL);
    const fetchMock = respondWith({
      store: { defaultLocale: 'uk', locales: ['uk'] },
    });
    await loadStorefrontLocales({
      ...config,
      apiKey: 'locales-test-token',
    }).catch(() => undefined);
    expect(fetchMock.mock.calls[0]![0]).toBe(SERVER_URL);
  });
});

describe('browser requests', () => {
  it('the browser client never reads the server address', async () => {
    vi.resetModules();
    vi.stubGlobal('window', {});
    vi.stubEnv('STOREFRONT_SERVER_GRAPHQL_URL', SERVER_URL);
    const HttpLink = vi.fn();
    vi.doMock('@apollo/client', async (original) => {
      const actual = await original<typeof import('@apollo/client')>();
      return {
        ...actual,
        HttpLink: class extends actual.HttpLink {
          constructor(options: { uri: string }) {
            super(options);
            HttpLink(options.uri);
          }
        },
      };
    });
    const browser = await import('./Environment');
    browser.createApolloClient(config, {}).stop();
    expect(HttpLink).toHaveBeenCalledWith(PUBLIC_URL);
    vi.doUnmock('@apollo/client');
  });
});
