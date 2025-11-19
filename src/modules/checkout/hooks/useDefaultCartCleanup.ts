import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import Cookies from 'js-cookie';
import { useCartContext } from '@src/providers/cart-context';

/**
 * Hook that provides a cleanup function to clear default cart data after order completion.
 *
 * Cleans up:
 * - Default cart cookie (default_cart_id)
 * - Cart context (cartKey and cartId)
 * - Specific checkout record from Relay store by ID
 *
 * @returns Cleanup function that accepts checkoutId to be called after successful order creation
 */
export function useDefaultCartCleanup() {
  const environment = useRelayEnvironment();
  const { setCartKey, setId } = useCartContext();

  const cleanup = useCallback(
    (checkoutId: string | null) => {
      // Remove default cart cookie (using the correct key from CartProvider)
      Cookies.remove('default_cart_id');

      // Clear cart context
      setCartKey(null);
      setId(null);

      // Remove specific checkout from Relay store if ID exists
      if (checkoutId) {
        environment.commitUpdate((store) => {
          store.delete(checkoutId);
        });
      }
    },
    [environment, setCartKey, setId]
  );

  return cleanup;
}
