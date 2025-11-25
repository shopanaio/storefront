"use client";

import { useMutation } from 'react-relay';
import { clearCartMutation } from '../../core/graphql/mutations/clearCartMutation';

import { useCartContext, useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import { ClearCartInput, UseClearCartReturn } from '../../core/types';

const useClearCart = (): UseClearCartReturn => {
  const cartId = useCartIdOnly();
  const { setCartKey, setId } = useCartContext();
  const actions = useCartActions();

  const [commitClearCart, isInFlight] = useMutation<any>(clearCartMutation);

  return {
    clearCart: async (
      input?: ClearCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<any> => {
      const currentCartId = input?.checkoutId || cartId;

      // If no cart in cookie or context — just exit
      if (!currentCartId) {
        console.warn('[useClearCart] No cart to clear');
        return null;
      }

      return new Promise((resolve, reject) => {
        const { checkoutClear } = actions;
        const { revert } = checkoutClear();
        commitClearCart({
          variables: {
            input: {
              checkoutId: currentCartId,
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
