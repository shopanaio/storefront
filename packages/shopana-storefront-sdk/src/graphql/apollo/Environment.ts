import {
  ApolloClient,
  ApolloLink,
  CombinedGraphQLErrors,
  HttpLink,
  type InMemoryCache,
  type NormalizedCacheObject,
  Observable,
  ServerError,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import type { FormattedExecutionResult } from 'graphql';
import { createApolloCache, type InMemoryCacheClass } from './cache';
import { RequestResultCache } from './requestResultCache';
import { clientNormalization } from './serverSwitches';
import { createQueryResultHoldLink } from './queryResultHold';
import { createStaticResultsLink } from '../../static/results';
import { createPersistedGetLink } from './persisted';
import { serverGraphqlUrl } from './serverEndpoint';
import { createUploadLink, hasUploadVariables } from './uploadLink';
import { storefrontSession } from '../../modules/session/core/StorefrontSessionClient';
import { readCookie } from '../../core/cookiePolicy';
import {
  ensureVisitorId,
  VISITOR_COOKIE_NAME,
  VISITOR_ID_HEADER,
} from '../../core/visitor';
import type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from './types';

const IS_SERVER = typeof window === 'undefined';
/** The gateway rejects the whole request when the bearer token is not valid (anymore). */
const CUSTOMER_INVALID_CODE = 'STOREFRONT_CUSTOMER_INVALID';

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
      ...(IS_SERVER ? options.gatewayHeaders : undefined),
      [config.apiKeyHeader]: config.apiKey,
    };

    const accessToken = IS_SERVER
      ? (options.accessToken ?? null)
      : await storefrontSession.getAccessToken();

    const visitorId = IS_SERVER
      ? readCookie(options.serverCookies, VISITOR_COOKIE_NAME)
      : ensureVisitorId(config.cookiePolicy);
    if (visitorId) headers[VISITOR_ID_HEADER] = visitorId;
    // The gateway picks the content language from Accept-Language (lz20).
    if (options.locale) headers['Accept-Language'] = options.locale;

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return { headers };
  });

  const httpLink = new HttpLink({
    uri: IS_SERVER ? serverGraphqlUrl(config) : config.graphqlUrl,
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

  // The browser takes what the server sent, whatever the server's switch is: a list of whole
  // responses, or a normalized snapshot.
  const { initialState } = options;
  const cache =
    IS_SERVER && clientNormalization && integration === plainIntegration
      ? // A plain Apollo client takes any cache; only an integration needs its InMemoryCache.
        (new RequestResultCache() as unknown as InMemoryCache)
      : createApolloCache(
          options.cacheConfig,
          integration.InMemoryCache,
          Array.isArray(initialState) ? initialState : undefined
        );
  if (initialState && !Array.isArray(initialState)) {
    cache.restore(initialState as NormalizedCacheObject);
  }

  return integration.createClient({
    cache,
    link: ApolloLink.from([
      // First: a held result waits for the hold to end whatever the links after it do with
      // it (a session retry runs inside). A query the static site answers (a client
      // navigation of a static document) asks the API nothing. A guest query of the
      // allow-list goes as a cached `GET`, before the session and the visitor id are added.
      ...(IS_SERVER
        ? []
        : [
            createQueryResultHoldLink(),
            createSessionRetryLink(),
            createStaticResultsLink(),
            createPersistedGetLink({
              uri: config.graphqlUrl,
              apiKeyHeader: config.apiKeyHeader,
              apiKey: config.apiKey,
              locale: options.locale,
            }),
          ]),
      authLink,
      ...(options.links ?? []),
      ...transportLinks,
    ]),
  });
}
