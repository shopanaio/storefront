import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { useCartContext, useCartIdUtils } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';

/**
 * Hook that provides a cleanup function to clear default cart data after order completion.
 *
 * Cleans up:
 * - Default cart cookie (via SDK cartIdUtils)
 * - Cart context (cartKey and cartId)
 * - Specific checkout record from Relay store by ID
 *
 * @returns Cleanup function that accepts checkoutId to be called after successful order creation
 */
export function useDefaultCartCleanup() {
  const environment = useRelayEnvironment();
  const { setCartKey, setId } = useCartContext();
  const { removeCartId } = useCartIdUtils();

  const cleanup = useCallback(
    (checkoutId: string | null) => {
      // Remove cart cookie via SDK utils
      removeCartId();

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
    [environment, setCartKey, setId, removeCartId]
  );

  return cleanup;
}
