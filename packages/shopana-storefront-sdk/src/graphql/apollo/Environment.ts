import {
  ApolloLink,
  CombinedGraphQLErrors,
  HttpLink,
  Observable,
  ServerError,
} from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import type { FormattedExecutionResult } from 'graphql';
import {
  ApolloClient,
  SSRMultipartLink,
} from '@apollo/client-integration-nextjs';
import { createApolloCache } from './cache';
import { storefrontSession } from '../../modules/session/core/StorefrontSessionClient';
import type {
  ApolloEnvironmentConfig,
  CreateApolloClientOptions,
} from './types';

const IS_SERVER = typeof window === 'undefined';
const VISITOR_COOKIE_NAME = 'shopana_storefront_visitor_id';
/** The gateway rejects the whole request when the bearer token is not valid (anymore). */
const CUSTOMER_INVALID_CODE = 'STOREFRONT_CUSTOMER_INVALID';

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

/**
 * Creates the Apollo client used by both the Next.js RSC preloader and the
 * browser provider. A new instance must be created for every server request.
 */
export function createApolloClient(
  config: ApolloEnvironmentConfig,
  options: CreateApolloClientOptions = {}
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
      document.cookie = `${VISITOR_COOKIE_NAME}=${visitorId}; Path=/; SameSite=Lax; Max-Age=2592000${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    }
    if (visitorId) headers['x-shopana-storefront-visitor-id'] = visitorId;

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
      ...(IS_SERVER ? [] : [createSessionRetryLink()]),
      authLink,
      ...(options.links ?? []),
      ...transportLinks,
    ]),
  });
}
