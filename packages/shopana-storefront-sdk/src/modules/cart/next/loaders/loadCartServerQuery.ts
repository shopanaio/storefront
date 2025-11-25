import { loadSerializableQuery } from '../../../../graphql/relay/loadSerializableQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { createFetchGraphQL } from '../../../../graphql/relay/Environment';
import type { RelayEnvironmentConfig } from '../../../../graphql/relay/types';
import { createCartIdUtils } from '../../core/utils/cartId';
import type { CartConfig } from '../../core/config';
import loadCartQueryNode, {
  loadCartQuery as LoadCartQueryType,
} from '../../core/graphql/queries/__generated__/loadCartQuery.graphql';

export interface LoadCartServerQueryOptions {
  /**
   * Relay environment configuration (GraphQL URL, API key, etc.)
   */
  environmentConfig: RelayEnvironmentConfig;
  /**
   * Cart configuration (cookie name, options)
   */
  cartConfig: CartConfig;
}

/**
 * Load cart data on server (Next.js)
 * Use this in Server Components to prefetch cart data
 *
 * @param options - Configuration options
 * @returns Preloaded query or null if no cart ID
 *
 * @example
 * ```ts
 * import { loadCartServerQuery } from '@shopana/storefront-sdk/modules/cart/next';
 *
 * const cartData = await loadCartServerQuery({
 *   environmentConfig,
 *   cartConfig,
 * });
 * ```
 */
export async function loadCartServerQuery(
  options: LoadCartServerQueryOptions
): Promise<SerializablePreloadedQuery<typeof loadCartQueryNode, LoadCartQueryType> | null> {
  const { environmentConfig, cartConfig } = options;

  // Dynamic import to avoid bundling next/headers in client code
  const { headers } = await import('next/headers');
  const cookie = (await headers()).get('cookie') ?? undefined;

  // Create cart ID utils with cart config
  const cartIdUtils = createCartIdUtils({
    cookieName: cartConfig.cookieName,
    cookieOptions: cartConfig.cookieOptions,
  });

  const cartId = cartIdUtils.getCartIdFromCookie(cookie);

  if (!cartId) {
    return null;
  }

  // Create networkFetch from environment config
  const networkFetch = createFetchGraphQL({
    graphqlUrl: environmentConfig.graphqlUrl,
    apiKeyHeader: environmentConfig.apiKeyHeader,
    apiKey: environmentConfig.apiKey,
    accessTokenCookieName: environmentConfig.accessTokenCookieName,
    serverCookies: cookie,
  });

  const preloadedQuery = await loadSerializableQuery<
    typeof loadCartQueryNode,
    LoadCartQueryType
  >(
    networkFetch,
    loadCartQueryNode.params,
    { checkoutId: cartId },
    cookie
  );

  return preloadedQuery;
}
