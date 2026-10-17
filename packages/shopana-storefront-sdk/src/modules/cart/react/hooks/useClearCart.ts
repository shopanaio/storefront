'use client';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { clearCartMutation } from '../../core/graphql/mutations/clearCartMutation';
import { useCartSetters, useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import { ClearCartInput, UseClearCartReturn } from '../../core/types';
const useClearCart = (): UseClearCartReturn => {
  const cartId = useCartIdOnly();

  const { setCartKey, setId, enqueueMutation } = useCartSetters();
  const actions = useCartActions();
  const [commitClearCart, isInFlight] = useMutation(clearCartMutation);
  return {
    clearCart: async (
      input?: ClearCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<unknown> => {
      const currentCartId = input?.checkoutId || cartId;
      // If no cart in cookie or context — just exit
      if (!currentCartId) {
        console.warn('[useClearCart] No cart to clear');
        return null;
      }
      return enqueueMutation(
        () =>
          new Promise((resolve, reject) => {
            commitClearCart({
              variables: {
                input: {
                  checkoutId: currentCartId,
                },
              },
              onCompleted: (response, errors) => {
                if (errors && errors.length > 0) {
                  options?.onError?.();
                  return reject(errors);
                } else if (response.checkoutLinesClear.errors.length > 0) {
                  options?.onError?.();
                  return reject(response.checkoutLinesClear.errors);
                } else {
                  setCartKey(response.checkoutLinesClear.checkout);
                  // If checkout became null — remove cookie and clear context
                  if (!response.checkoutLinesClear.checkout) {
                    setId(null);
                  }
                  options?.onSuccess?.();
                  return resolve(response);
                }
              },
              onError: (err) => {
                options?.onError?.();
                return reject(err);
              },
            });
          }),
        () => {
          actions.checkoutClear();
        }
      );
    },
    loading: isInFlight,
  };
};
export default useClearCart;
