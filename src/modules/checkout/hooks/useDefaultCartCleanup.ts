import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import Cookies from 'js-cookie';

/**
 * Hook that provides a cleanup function to clear default cart data after order completion.
 *
 * Cleans up:
 * - Default cart cookie (shopana_cart_id)
 * - Specific checkout record from Relay store by ID
 *
 * @returns Cleanup function that accepts checkoutId to be called after successful order creation
 */
export function useDefaultCartCleanup() {
  const environment = useRelayEnvironment();

  const cleanup = useCallback(
    (checkoutId: string | null) => {
      // Remove default cart cookie
      Cookies.remove('shopana_cart_id');

      console.log('Cleaning up default cart');
      console.log('checkoutId', checkoutId);

      // Remove specific checkout from Relay store if ID exists
      if (checkoutId) {
        environment.commitUpdate((store) => {
          store.delete(checkoutId);
        });
        console.log(
          `[Order Completion] Cleaned up default cart and removed checkout ${checkoutId} from Relay store`
        );
      } else {
        console.log('[Order Completion] Cleaned up default cart');
      }
    },
    [environment]
  );

  return cleanup;
}
