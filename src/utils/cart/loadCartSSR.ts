/**
 * SSR Cart Loader Utility
 *
 * Provides server-side cart loading functionality using SDK's Next.js adapter.
 * This utility should be used in Server Components and route handlers to
 * preload cart data before rendering.
 *
 * @example
 * ```tsx
 * // In a Server Component or page:
 * import { loadCartSSR } from '@src/utils/cart/loadCartSSR';
 * import { cookies } from 'next/headers';
 *
 * export default async function Page() {
 *   const cartId = cookies().get('shopana_cart_id')?.value;
 *   const initialCartData = cartId ? await loadCartSSR(cartId) : null;
 *
 *   return <ClientComponent initialCartData={initialCartData} />;
 * }
 * ```
 */

import { loadCartServerQuery } from '@shopana/storefront-sdk/modules/cart/next';
import { getCurrentEnvironment } from '@src/relay/Environment';

/**
 * Load cart data on the server side
 *
 * @param cartId - The cart ID from cookies
 * @returns Preloaded query reference for cart data
 */
export async function loadCartSSR(cartId: string) {
  const environment = getCurrentEnvironment();
  return loadCartServerQuery(environment, cartId);
}
