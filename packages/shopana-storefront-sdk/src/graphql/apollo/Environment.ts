import { ApolloLink, HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import {
  ApolloClient,
  SSRMultipartLink,
} from '@apollo/client-integration-nextjs';
import { createApolloCache } from './cache';
import type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from './types';

const IS_SERVER = typeof window === 'undefined';

function getCookieValue(
  cookieName: string,
  serverCookies?: string
): string | null {
  const cookieSource = IS_SERVER ? serverCookies : document.cookie;
  if (!cookieSource) {
    return null;
  }

  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cookieSource.match(
    new RegExp(`(?:^|; )${escapedName}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Creates the Apollo client used by both the Next.js RSC preloader and the
 * browser provider. A new instance must be created for every server request.
 */
export function createApolloClient(
  config: ApolloEnvironmentConfig,
  options: CreateApolloClientOptions = {}
): ApolloClient {
  const authLink = new SetContextLink((previousContext) => {
    const headers = {
      ...(previousContext.headers as Record<string, string> | undefined),
      [config.apiKeyHeader]: config.apiKey,
    };

    const accessToken = getCookieValue(
      config.applicationAuth.accessTokenCookieName,
      options.serverCookies
    );

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return { headers };
  });

  const httpLink = new HttpLink({
    uri: config.graphqlUrl,
    credentials: 'include',
  });

  const transportLinks = IS_SERVER
    ? [new SSRMultipartLink({ stripDefer: true }), httpLink]
    : [httpLink];

  const cache = createApolloCache(options.cacheConfig);
  if (options.initialState) {
    cache.restore(options.initialState);
  }

  return new ApolloClient({
    cache,
    link: ApolloLink.from([
      authLink,
      ...(options.links ?? []),
      ...transportLinks,
    ]),
  });
}
