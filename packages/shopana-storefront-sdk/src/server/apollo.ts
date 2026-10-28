import type { ApolloClient } from '@apollo/client';
import { createApolloClient } from '../graphql/apollo/Environment';
import type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from '../graphql/apollo/types';
import { STOREFRONT_LOCALE_HEADER } from '../modules/localization/core/constants';
import { readServerAuthState } from '../modules/session/server';
import {
  apolloEnvironmentKey,
  rememberApolloRequestClient,
} from './requestClient';
import {
  cacheForRequest,
  getServerRequestScope,
  readServerRequestHeaders,
} from './requestScope';

export type RequestAuth = Pick<
  CreateApolloClientOptions,
  'serverCookies' | 'accessToken' | 'locale'
>;

/** Cookies, the session access token and the locale of the current server request. */
export async function readRequestAuth(): Promise<RequestAuth> {
  const headers = await readServerRequestHeaders();
  const serverCookies = headers.get('cookie') ?? undefined;
  const locale = headers.get(STOREFRONT_LOCALE_HEADER) ?? undefined;
  const { accessToken } = await readServerAuthState(serverCookies);
  return { serverCookies, accessToken, locale };
}

const scopedRequestClient = cacheForRequest(
  async (config: ApolloEnvironmentConfig) => {
    const client = createApolloClient(config, await readRequestAuth());
    rememberApolloRequestClient(config, client);
    return client;
  },
  apolloEnvironmentKey
);

/**
 * The Apollo client of the current server request, shared by every loader and server
 * component of the request, so that one cache snapshot carries all their queries to the
 * browser.
 */
export async function getApolloRequestClient(
  config: ApolloEnvironmentConfig
): Promise<ApolloClient> {
  if (getServerRequestScope()) return scopedRequestClient(config);
  const { getNextApolloRequestClient } = await import('../next/apollo/server');
  return getNextApolloRequestClient(config);
}
