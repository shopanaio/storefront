import { Kind, type DocumentNode } from 'graphql';
const pingQuery: DocumentNode = {
  kind: Kind.DOCUMENT,
  definitions: [
    {
      kind: Kind.OPERATION_DEFINITION,
      operation: 'query' as import('graphql').OperationTypeNode,
      selectionSet: {
        kind: Kind.SELECTION_SET,
        selections: [
          { kind: Kind.FIELD, name: { kind: Kind.NAME, value: 'ping' } },
        ],
      },
    },
  ],
};
import { ApolloLink, Observable } from '@apollo/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { ApolloEnvironmentConfig } from './types';

const config: ApolloEnvironmentConfig = {
  graphqlUrl: 'https://api.example.test/graphql',
  apiKeyHeader: 'x-shopana-storefront-access-token',
  apiKey: 'public-test-token',
  applicationAuth: {
    iamUrl: 'https://iam.example.test',
    applicationId: 'test',
  },
};

function captureHeaders(headers: Record<string, string>[]) {
  return new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        headers.push(operation.getContext().headers);
        observer.next({ data: { ping: 'pong' } });
        observer.complete();
      })
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  document.cookie = 'shopana_storefront_visitor_id=; Path=/; Max-Age=0';
});

it('keeps the same visitor when a new browser client and an SSR client load the cart', async () => {
  const headers: Record<string, string>[] = [];
  const { createApolloClient } = await import('./Environment');
  for (let page = 0; page < 2; page++) {
    const client = createApolloClient(config, {
      links: [captureHeaders(headers)],
    });
    await client.query({
      query: pingQuery,
      fetchPolicy: 'network-only',
    });
    client.stop();
  }
  const visitorId = headers[0]['x-shopana-storefront-visitor-id'];
  expect(visitorId).toMatch(/^[A-Za-z0-9._~-]{16,128}$/);
  expect(headers[1]['x-shopana-storefront-visitor-id']).toBe(visitorId);
  const serverCookies = document.cookie;
  expect(serverCookies).toContain(visitorId);

  vi.stubGlobal('window', undefined);
  vi.resetModules();
  const { createApolloClient: createServerClient } =
    await import('./Environment');
  const serverClient = createServerClient(config, {
    serverCookies,
    links: [captureHeaders(headers)],
  });
  await serverClient.query({
    query: pingQuery,
    fetchPolicy: 'network-only',
  });
  expect(headers[2]['x-shopana-storefront-visitor-id']).toBe(visitorId);
  serverClient.stop();
});

it('refreshes the session once and repeats a request the gateway rejected for its token (S6)', async () => {
  document.cookie = 'shopana_signed_in=1; Path=/';
  const session = (accessToken: string) => ({
    session: {
      user: { id: 'user-1', email: 'buyer@example.test' },
      accessToken,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    },
  });
  const sessionCalls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init: RequestInit = {}) => {
      sessionCalls.push(`${init.method ?? 'GET'} ${input}`);
      return Response.json(
        session(input === '/auth/refresh' ? 'fresh-token' : 'stale-token')
      );
    })
  );
  const authorizations: string[] = [];
  const gateway = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        const authorization = operation.getContext().headers.Authorization;
        authorizations.push(authorization);
        observer.next(
          authorization === 'Bearer stale-token'
            ? {
                errors: [
                  {
                    message: 'invalid customer',
                    extensions: { code: 'STOREFRONT_CUSTOMER_INVALID' },
                  },
                ],
              }
            : { data: { ping: 'pong' } }
        );
        observer.complete();
      })
  );
  const { createApolloClient } = await import('./Environment');
  const client = createApolloClient(config, { links: [gateway] });
  const result = await client.query({
    query: pingQuery,
    fetchPolicy: 'network-only',
  });
  expect(result.data).toEqual({ ping: 'pong' });
  expect(authorizations).toEqual(['Bearer stale-token', 'Bearer fresh-token']);
  expect(sessionCalls).toEqual(['GET /auth/token', 'POST /auth/refresh']);
  client.stop();
  document.cookie = 'shopana_signed_in=; Path=/; Max-Age=0';
});
