"use client";

import { graphql, useMutation } from 'react-relay';
// @ts-ignore - TODO: Phase 2 - Move useCartContext to SDK
import { useCartContext } from '@src/providers/cart-context';
// @ts-ignore - TODO: Phase 2 - Move useCartStore to SDK
import { useCartStore } from '@src/store/cartStore';

import useCart from './useCart';
import { ClearCartInput, UseClearCartReturn } from '../../core/types';

const useClearCartMutation = graphql`
  mutation useClearCartMutation($input: CheckoutLinesClearInput!) {
    checkoutMutation {
      checkoutLinesClear(input: $input) {
        checkout {
          ...useCart_CartFragment
        }
        errors {
          field
          message
        }
      }
    }
  }
`;

const useClearCart = (): UseClearCartReturn => {
  const { cart } = useCart();
  const { setCartKey, setId } = useCartContext();

  const [commitClearCart, isInFlight] = useMutation<any>(useClearCartMutation);

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
        const { checkoutClear } = useCartStore.getState();
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
