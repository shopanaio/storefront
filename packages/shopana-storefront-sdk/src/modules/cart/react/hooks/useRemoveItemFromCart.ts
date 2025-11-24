"use client";

import { useMutation } from 'react-relay';
import { removeFromCartMutation } from '../../core/graphql/mutations/removeFromCartMutation';

import { useCartStore } from '../context';
import useCart from './useCart';
import { RemoveFromCartInput } from '../../core/types';

const useRemoveItemFromCart = () => {
  const { cart } = useCart();
  const store = useCartStore();

  const [commitRemoveLine, isInFlight] = useMutation<any>(
    removeFromCartMutation
  );

  return {
    removeFromCart: async (
      input: RemoveFromCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<any> => {
      const cartId = cart?.id;

      // If no cart in cookie or context — just exit
      if (!cartId || !cart?.id) {
        console.warn('[useRemoveItemFromCart] No cart to remove from');
        return null;
      }

      return new Promise((resolve, reject) => {
        const { checkoutLinesDelete } = store;
        const { revert } = checkoutLinesDelete({ lineIds: [input.lineId] });
        commitRemoveLine({
          variables: {
            input: {
              checkoutId: cart.id,
              lineIds: [input.lineId],
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              revert();
              options?.onError?.();
              return reject(errors);
            } else if (
              response?.checkoutMutation?.checkoutLinesDelete?.errors &&
              response.checkoutMutation.checkoutLinesDelete.errors.length > 0
            ) {
              revert();
              options?.onError?.();
              return reject(
                response.checkoutMutation.checkoutLinesDelete.errors
              );
            } else {
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

export default useRemoveItemFromCart;
