"use client";

import { useMutation } from 'react-relay';
import { clearCartMutation } from '../../core/graphql/mutations/clearCartMutation';

import { useCartContext, useCartStore } from '../context';
import useCart from './useCart';
import { ClearCartInput, UseClearCartReturn } from '../../core/types';

const useClearCart = (): UseClearCartReturn => {
  const { cart } = useCart();
  const { setCartKey, setId } = useCartContext();
  const store = useCartStore();

  const [commitClearCart, isInFlight] = useMutation<any>(clearCartMutation);

  return {
    clearCart: async (
      input?: ClearCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<any> => {
      const cartId = input?.checkoutId || cart?.id;

      // If no cart in cookie or context — just exit
      if (!cartId) {
        console.warn('[useClearCart] No cart to clear');
        return null;
      }

      return new Promise((resolve, reject) => {
        const { checkoutClear } = store;
        const { revert } = checkoutClear();
        commitClearCart({
          variables: {
            input: {
              checkoutId: cartId,
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              revert();
              options?.onError?.();
              return reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesClear?.errors &&
              response.checkoutMutation.checkoutLinesClear.errors.length > 0
            ) {
              revert();
              options?.onError?.();
              return reject(
                response.checkoutMutation.checkoutLinesClear.errors
              );
            } else {
              // If checkout became null — remove cookie and clear context
              if (!response?.checkoutMutation?.checkoutLinesClear?.checkout) {
                setCartKey(null);
                setId(null);
              }
              options?.onSuccess?.();
              return resolve(response);
            }
          },
          onError: (err) => {
            revert();
            options?.onError?.();
            return reject(err);
          },
        });
      });
    },
    loading: isInFlight,
  };
};

export default useClearCart;
