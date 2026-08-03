"use client";

import { useMutation } from 'react-relay';
import { clearCartMutation } from '../../core/graphql/mutations/clearCartMutation';
import type { clearCartMutation as ClearCartMutationType } from '../../core/graphql/mutations/__generated__/clearCartMutation.graphql';

import { useCartContext, useCartActions } from '../context/CartContext';
import { useCartIdOnly, useCartVersionOnly } from './useCartSelectors';
import { ClearCartInput, UseClearCartReturn } from '../../core/types';
import { createCheckoutIdempotencyKey } from '../../core/utils/idempotencyKey';

const useClearCart = (): UseClearCartReturn => {
  const cartId = useCartIdOnly();
  const cartVersion = useCartVersionOnly();
  const { setCartKey, setId } = useCartContext();
  const actions = useCartActions();

  const [commitClearCart, isInFlight] =
    useMutation<ClearCartMutationType>(clearCartMutation);

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
      if (cartVersion == null) {
        throw new Error('Cart version is unavailable');
      }

      return new Promise((resolve, reject) => {
        const { checkoutClear } = actions;
        const { revert } = checkoutClear();
        commitClearCart({
          variables: {
            input: {
              checkoutId: currentCartId,
              expectedCheckoutVersion: cartVersion,
              idempotencyKey: createCheckoutIdempotencyKey(),
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              revert();
              options?.onError?.();
              return reject(errors);
            } else if (
              response.checkoutLinesClear.errors.length > 0
            ) {
              revert();
              options?.onError?.();
              return reject(
                response.checkoutLinesClear.errors
              );
            } else {
              // If checkout became null — remove cookie and clear context
              if (!response.checkoutLinesClear.checkout) {
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
