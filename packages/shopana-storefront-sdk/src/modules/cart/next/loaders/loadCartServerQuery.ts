import {
  loadSerializableQuery,
  type SerializableApolloQuery,
} from '../../../../graphql/apollo/loadSerializableQuery';
import type { ApolloEnvironmentConfig } from '../../../../graphql/apollo/types';
import { createCartIdUtils } from '../../core/utils/cartId';
import type { CartConfig } from '../../core/config';
import {
  SdkLoadCartQueryDocument,
  type SdkLoadCartQuery,
  type SdkLoadCartQueryVariables,
} from '../../../../graphql/apollo/generated/operations';
import type { ApolloClient } from '@apollo/client';
import { getApolloRequestClient } from '../../../../server/apollo';
import { readServerRequestHeaders } from '../../../../server/requestScope';
import { readServerAuthState } from '../../../session/server';
export interface LoadCartServerQueryOptions {
  /**
   * Apollo environment configuration (GraphQL URL, API key, etc.)
   */
  environmentConfig: ApolloEnvironmentConfig;
  /**
   * Cart configuration (cookie name, options)
   */
  cartConfig: CartConfig;
  /** Reuse the request-scoped client when composing multiple root queries. */
  client?: ApolloClient;
  /** Cookie header paired with the supplied request-scoped client. */
  serverCookies?: string;
}
/**
 * Load cart data on the server, in a Next.js server component or a React Router loader
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
): Promise<SerializableApolloQuery<
  SdkLoadCartQuery,
  SdkLoadCartQueryVariables
> | null> {
  const { environmentConfig, cartConfig } = options;
  let cookie = options.serverCookies;
  if (!options.client && cookie === undefined) {
    cookie = (await readServerRequestHeaders()).get('cookie') ?? undefined;
  }
  // Create cart ID utils with cart config
  const cartIdUtils = createCartIdUtils({
    cookieName: cartConfig.cookieName,
  });
  const cartId = cartIdUtils.getCartIdFromCookie(cookie);
  if (!cartId) {
    return null;
  }
  // An account cart read without the expired access token answers "no checkout" and would
  // drop the cart cookie; the browser reads it once the session server refreshed the token.
  if ((await readServerAuthState(cookie)).refreshPending) {
    return null;
  }
  // Create networkFetch from environment config
  const client =
    options.client ?? (await getApolloRequestClient(environmentConfig));
  return loadSerializableQuery(client, SdkLoadCartQueryDocument, {
    checkoutId: cartId,
  });
}
