/**
 * SSR Cart Loader Utility
 *
 * Loads cart data on the server using the same Relay/GraphQL pipeline
 * as the rest of the app. Uses the cart cookie name from `cartConfig`
 * and returns a serializable preloaded query that can be passed to
 * client components and hydrated via `useSerializablePreloadedQuery`.
 *
 * Usage (Server Component):
 * ```tsx
 * import { loadCartSSR } from '@src/utils/cart/loadCartSSR';
 * import ClientComponent from './ClientComponent';
 *
 * export default async function Page() {
 *   const preloadedCartQuery = await loadCartSSR();
 *
 *   return <ClientComponent preloadedCartQuery={preloadedCartQuery} />;
 * }
 * ```
 */

import { headers } from 'next/headers';
import loadSerializableQuery, {
  SerializablePreloadedQuery,
} from '@src/relay/loadSerializableQuery';
import loadCartQueryNode, {
  loadCartQuery as LoadCartQueryType,
} from '@shopana/storefront-sdk/modules/cart/core/graphql/queries/__generated__/loadCartQuery.graphql';
import { createCartIdUtils } from '@shopana/storefront-sdk/modules/cart/core/utils/cartId';
import { cartConfig } from '@src/config/cart.config';

// Create cart ID utils configured with the same cookie name/options as CartProvider
const cartIdUtils = createCartIdUtils({
  cookieName: cartConfig.cookieName,
  cookieOptions: cartConfig.cookieOptions,
});

/**
 * Load cart data on the server side
 *
 * - Reads cookies from the incoming request
 * - Extracts cart ID using the same cookie name as the client CartProvider
 * - If no cart ID is found, returns `null`
 * - Otherwise, returns a serializable preloaded query for the cart
 */
export async function loadCartSSR(): Promise<
  SerializablePreloadedQuery<typeof loadCartQueryNode, LoadCartQueryType> | null
> {
  const cookieHeader = (await headers()).get('cookie') ?? undefined;
  const cartId = cartIdUtils.getCartIdFromCookie(cookieHeader);

  if (!cartId) {
    return null;
  }

  const preloadedQuery = await loadSerializableQuery<
    typeof loadCartQueryNode,
    LoadCartQueryType
  >(loadCartQueryNode.params, { checkoutId: cartId }, cookieHeader);

  return preloadedQuery;
}
