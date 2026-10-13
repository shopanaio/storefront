'use client';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { updateCartLineQuantityMutation } from '../../core/graphql/mutations/updateCartLineQuantityMutation';
import { useCartActions } from '../context/CartContext';
import { useCartIdOnly, useCartVersionOnly } from './useCartSelectors';
import { createCheckoutIdempotencyKey } from '../../core/utils/idempotencyKey';
const useUpdateCartLineQuantity = () => {
  const cartId = useCartIdOnly();
  const cartVersion = useCartVersionOnly();
  const actions = useCartActions();
  const [commit, isInFlight] = useMutation(updateCartLineQuantityMutation);
  const updateQuantity = async (
    {
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    },
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    const { checkoutLinesUpdate } = actions;
    if (!cartId) {
      console.warn('[useUpdateCartLineQuantity] No cart to update');
      return null;
    }
    if (cartVersion == null) {
      throw new Error('Cart version is unavailable');
    }
    const { revert } = checkoutLinesUpdate({
      lines: [{ lineId: cartItemId, quantity }],
    });
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          input: {
            checkoutId: cartId,
            expectedCheckoutVersion: cartVersion,
            idempotencyKey: createCheckoutIdempotencyKey(),
            lines: [
              {
                lineId: cartItemId,
                quantity,
              },
            ],
          },
        },
        onCompleted: (response, errors) => {
          if (errors && errors.length > 0) {
            revert();
            options?.onError?.();
            return reject(errors);
          } else if (response.checkoutLinesUpdate.errors.length > 0) {
            revert();
            options?.onError?.();
            return reject(response.checkoutLinesUpdate.errors);
          } else {
            options?.onSuccess?.();
            return resolve(response.checkoutLinesUpdate.checkout);
          }
        },
        onError: (err) => {
          revert();
          options?.onError?.();
          return reject(err);
        },
      });
    });
  };
  return { updateQuantity, loading: isInFlight };
};
export default useUpdateCartLineQuantity;
