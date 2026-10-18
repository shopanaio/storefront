import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { clearCustomerInputs } from '#checkout/sections/delivery/customerInputStorage';
import {
  useCartContext,
  useCartIdUtils,
} from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';

/**
 * Hook that provides a cleanup function to clear default cart data after order completion.
 *
 * Cleans up:
 * - Default cart cookie (via SDK cartIdUtils)
 * - Cart context (cartKey and cartId)
 * - Specific checkout record from Apollo cache by ID
 * - Delivery customer input kept in localStorage
 *
 * @returns Cleanup function that accepts checkoutId to be called after successful order creation
 */
export function useDefaultCartCleanup() {
  const client = useApolloClient();
  const { setCartKey, setId } = useCartContext();
  const { removeCartIdCookie } = useCartIdUtils();

  const cleanup = useCallback(
    (checkoutId: string | null) => {
      // Remove cart cookie via SDK utils
      removeCartIdCookie();

      // Clear cart context
      setCartKey(null);
      setId(null);

      // Drop the delivery customer input entered for the placed checkout
      clearCustomerInputs();

      // Remove the checkout from Apollo cache if an ID exists
      if (checkoutId) {
        client.cache.evict({
          id: client.cache.identify({ __typename: 'Checkout', id: checkoutId }),
        });
        client.cache.gc();
      }
    },
    [client, setCartKey, setId, removeCartIdCookie]
  );

  return cleanup;
}
