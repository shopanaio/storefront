import { headers } from 'next/headers';
import { GraphQLResponse, RequestParameters } from 'relay-runtime';
import { loadSerializableQuery, SerializablePreloadedQuery } from '../../../../graphql/relay';
import { cartIdUtils } from '../../core/utils';

/**
 * Load cart data on server (Next.js)
 * Use this in Server Components to prefetch cart data
 *
 * @param networkFetch - Network fetch function from your Relay Environment
 * @param queryParams - Request parameters from your generated loadCartQuery (e.g., loadCartQueryNode.params)
 * @returns Preloaded query or null if no cart ID
 *
 * @example
 * ```ts
 * // Import your network fetch function from your Relay environment
 * import { networkFetch } from '@/lib/relay/Environment';
 * import loadCartQueryNode from '@shopana/storefront-sdk/modules/cart/core/graphql/queries/__generated__/loadCartQuery.graphql';
 *
 * const cartData = await loadCartServerQuery(networkFetch, loadCartQueryNode.params);
 * ```
 */
export async function loadCartServerQuery(
  networkFetch: (
    params: RequestParameters,
    variables: any,
    serverCookies?: string
  ) => Promise<GraphQLResponse>,
  queryParams: RequestParameters
): Promise<SerializablePreloadedQuery<any, any> | null> {
  const cookie = (await headers()).get('cookie') ?? undefined;
  const cartId = cartIdUtils.getCartIdFromCookie(cookie);

  if (!cartId) {
    return null;
  }

  const preloadedQuery = await loadSerializableQuery(
    networkFetch,
    queryParams,
    { checkoutId: cartId },
    cookie
  );

  return preloadedQuery;
}
