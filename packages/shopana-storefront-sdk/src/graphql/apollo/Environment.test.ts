import { ApolloLink, gql, Observable } from '@apollo/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { ApolloEnvironmentConfig } from './types';

vi.mock('@apollo/client-integration-nextjs', async () => {
  const { ApolloClient, ApolloLink, InMemoryCache } =
    await import('@apollo/client');
  return { ApolloClient, InMemoryCache, SSRMultipartLink: ApolloLink };
});

const config: ApolloEnvironmentConfig = {
  graphqlUrl: 'https://api.example.test/graphql',
  apiKeyHeader: 'x-shopana-storefront-access-token',
  apiKey: 'public-test-token',
  applicationAuth: {
    iamUrl: 'https://iam.example.test',
    applicationId: 'test',
    clientId: 'test',
    resource: 'https://api.example.test',
    redirectUri: 'https://shop.example.test/callback',
    accessTokenCookieName: 'test_access_token',
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
      query: gql`
        {
          ping
        }
      `,
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
    query: gql`
      {
        ping
      }
    `,
    fetchPolicy: 'network-only',
  });
  expect(headers[2]['x-shopana-storefront-visitor-id']).toBe(visitorId);
  serverClient.stop();
});
