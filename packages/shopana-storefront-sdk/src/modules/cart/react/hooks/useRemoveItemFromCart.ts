'use client';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { removeFromCartMutation } from '../../core/graphql/mutations/removeFromCartMutation';
import { useCartActions } from '../context/CartContext';
import { useCartIdOnly, useCartVersionOnly } from './useCartSelectors';
import { RemoveFromCartInput } from '../../core/types';
import { createCheckoutIdempotencyKey } from '../../core/utils/idempotencyKey';
const useRemoveItemFromCart = () => {
  const cartId = useCartIdOnly();
  const cartVersion = useCartVersionOnly();
  const actions = useCartActions();
  const [commitRemoveLine, isInFlight] = useMutation(removeFromCartMutation);
  return {
    removeFromCart: async (
      input: RemoveFromCartInput,
      options?: {
        onSuccess?: () => void;
        onError?: () => void;
      }
    ): Promise<unknown> => {
      // If no cart in cookie or context — just exit
      if (!cartId) {
        console.warn('[useRemoveItemFromCart] No cart to remove from');
        return null;
      }
      if (cartVersion == null) {
        throw new Error('Cart version is unavailable');
      }
      return new Promise((resolve, reject) => {
        const { checkoutLinesDelete } = actions;
        const { revert } = checkoutLinesDelete({ lineIds: [input.lineId] });
        commitRemoveLine({
          variables: {
            input: {
              checkoutId: cartId,
              expectedCheckoutVersion: cartVersion,
              idempotencyKey: createCheckoutIdempotencyKey(),
              lineIds: [input.lineId],
            },
          },
          onCompleted: (response, errors) => {
            if (errors && errors.length > 0) {
              revert();
              options?.onError?.();
              return reject(errors);
            } else if (response.checkoutLinesDelete.errors.length > 0) {
              revert();
              options?.onError?.();
              return reject(response.checkoutLinesDelete.errors);
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
