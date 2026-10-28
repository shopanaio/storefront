import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  HttpLink,
  type InMemoryCache,
  Observable,
  ServerError,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import type { FormattedExecutionResult } from 'graphql';
import { createApolloCache, type InMemoryCacheClass } from './cache';
import { createUploadLink, hasUploadVariables } from './uploadLink';
import { storefrontSession } from '../../modules/session/core/StorefrontSessionClient';
import {
  readCookie,
  resolveCookieAttributes,
  serializeCookie,
} from '../../core/cookiePolicy';
import type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from './types';

const IS_SERVER = typeof window === 'undefined';
const VISITOR_COOKIE_NAME = 'shopana_storefront_visitor_id';
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
/** The gateway rejects the whole request when the bearer token is not valid (anymore). */
const CUSTOMER_INVALID_CODE = 'STOREFRONT_CUSTOMER_INVALID';

function getCookieValue(
  cookieName: string,
  serverCookies?: string
): string | null {
  return readCookie(IS_SERVER ? serverCookies : document.cookie, cookieName);
}

function hasCustomerInvalidError(
  errors: FormattedExecutionResult['errors']
): boolean {
  return Boolean(
    errors?.some((error) => error.extensions?.code === CUSTOMER_INVALID_CODE)
  );
}

function isCustomerInvalidFailure(error: unknown): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return hasCustomerInvalidError(error.errors);
  }
  return ServerError.is(error) && error.statusCode === 401;
}

/**
 * S6: a request the gateway rejected for an invalid access token is sent once more after the
 * session server refreshed the token. When the session is over, the retry goes as a guest and
 * the session provider reports the expiry.
 */
function createSessionRetryLink(): ApolloLink {
  return new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let attempt = 0;
        let refreshing = false;
        let subscription: { unsubscribe(): void } | null = null;
        const retry = () => {
          refreshing = true;
          storefrontSession
            .refresh()
            .catch(() => null)
            .then(() => {
              refreshing = false;
              if (!observer.closed) run();
            });
        };
        const run = () => {
          const current = ++attempt;
          subscription = forward(operation).subscribe({
            next: (result) => {
              if (current === 1 && hasCustomerInvalidError(result.errors)) {
                retry();
                return;
              }
              observer.next(result);
            },
            error: (error: unknown) => {
              if (current === 1 && isCustomerInvalidFailure(error)) {
                retry();
                return;
              }
              observer.error(error);
            },
            complete: () => {
              if (!refreshing && current === attempt) observer.complete();
            },
          });
        };
        run();
        return () => subscription?.unsubscribe();
      })
  );
}

/** What a framework integration changes in the client: its client class, its server links. */
export interface ApolloClientIntegration<TClient extends ApolloClient> {
  /** The cache class the client needs; Apollo's `InMemoryCache` by default. */
  InMemoryCache?: InMemoryCacheClass;
  createClient(options: { cache: InMemoryCache; link: ApolloLink }): TClient;
  /** Links in front of the HTTP link on the server (streaming SSR transport). */
  serverLinks?: () => ApolloLink[];
}

const plainIntegration: ApolloClientIntegration<ApolloClient> = {
  createClient: (options) => new ApolloClient(options),
};

/**
 * Creates the Apollo client of the storefront: on the server for one request (a new instance
 * for every request), in the browser once. Without an integration it is a plain Apollo client,
 * as React Router renders with; Next.js passes its streaming integration.
 */
export function createApolloClient(
  config: ApolloEnvironmentConfig,
  options?: CreateApolloClientOptions
): ApolloClient;
export function createApolloClient<TClient extends ApolloClient>(
  config: ApolloEnvironmentConfig,
  options: CreateApolloClientOptions,
  integration: ApolloClientIntegration<TClient>
): TClient;
export function createApolloClient(
  config: ApolloEnvironmentConfig,
  options: CreateApolloClientOptions = {},
  integration: ApolloClientIntegration<ApolloClient> = plainIntegration
): ApolloClient {
  const authLink = new SetContextLink(async (previousContext) => {
    const headers = {
      ...(previousContext.headers as Record<string, string> | undefined),
      [config.apiKeyHeader]: config.apiKey,
    };

    const accessToken = IS_SERVER
      ? (options.accessToken ?? null)
      : await storefrontSession.getAccessToken();

    let visitorId = getCookieValue(VISITOR_COOKIE_NAME, options.serverCookies);
    if (!visitorId && !IS_SERVER) {
      visitorId = crypto.randomUUID();
      document.cookie = serializeCookie(VISITOR_COOKIE_NAME, visitorId, {
        ...resolveCookieAttributes(config.cookiePolicy, {
          secure: window.location.protocol === 'https:',
        }),
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    }
    if (visitorId) headers['x-shopana-storefront-visitor-id'] = visitorId;
    // The gateway picks the content language from Accept-Language (lz20).
    if (options.locale) headers['Accept-Language'] = options.locale;

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return { headers };
  });

  const httpLink = new HttpLink({
    uri: config.graphqlUrl,
    credentials: 'include',
  });

  // Files are uploaded from the browser only (customer media), as a multipart request.
  const transportLinks = IS_SERVER
    ? [...(integration.serverLinks?.() ?? []), httpLink]
    : [
        ApolloLink.split(
          (operation) => hasUploadVariables(operation.variables),
          createUploadLink(config.graphqlUrl),
          httpLink
        ),
      ];

  const cache = createApolloCache(
    options.cacheConfig,
    integration.InMemoryCache
  );
  if (options.initialState) {
    cache.restore(options.initialState);
  }

  return integration.createClient({
    cache,
    link: ApolloLink.from([
      ...(IS_SERVER ? [] : [createSessionRetryLink()]),
      authLink,
      ...(options.links ?? []),
      ...transportLinks,
    ]),
  });
}
