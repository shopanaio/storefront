import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import Cookies from 'js-cookie';
import { useBoxBuilderStore } from '@src/store/appStore';
import { useCartContext } from '@src/providers/cart-context';

/**
 * Hook that provides a cleanup function to clear box-builder cart data after order completion.
 *
 * Cleans up:
 * - Box-builder cart cookie (box-builder_cart_id)
 * - Box-builder store data (localStorage)
 * - Cart context (cartKey and cartId)
 * - Specific checkout record from Relay store by ID
 *
 * @returns Cleanup function that accepts checkoutId to be called after successful order creation
 */
export function useBoxBuilderCartCleanup() {
  const clearBoxBuilder = useBoxBuilderStore((state) => state.clearAll);
  const environment = useRelayEnvironment();
  const { setCartKey, setId } = useCartContext();

  const cleanup = useCallback((checkoutId: string | null) => {
    // Remove box-builder cart cookie
    Cookies.remove('box-builder_cart_id');

    // Clear box-builder store (localStorage)
    clearBoxBuilder();

    // Clear cart context
    setCartKey(null);
    setId(null);

    // Remove specific checkout from Relay store if ID exists
    if (checkoutId) {
      environment.commitUpdate((store) => {
        store.delete(checkoutId);
      });
      console.log(`[Order Completion] Cleaned up box-builder cart, store, context, and removed checkout ${checkoutId} from Relay store`);
    } else {
      console.log('[Order Completion] Cleaned up box-builder cart, store, and context');
    }
  }, [clearBoxBuilder, environment, setCartKey, setId]);

  return cleanup;
}
