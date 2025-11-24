"use client";

import { useMutation } from 'react-relay';
import type { updateCartLineQuantityMutation as CartLineQuantityMutationType } from '../../core/graphql/mutations/__generated__/updateCartLineQuantityMutation.graphql';
import { updateCartLineQuantityMutation } from '../../core/graphql/mutations/updateCartLineQuantityMutation';
import { useCartActions } from '../context';
import { useCartIdOnly } from './useCartSelectors';

const useUpdateCartLineQuantity = () => {
  const cartId = useCartIdOnly();
  const actions = useCartActions();
  const [commit, isInFlight] = useMutation<CartLineQuantityMutationType>(
    updateCartLineQuantityMutation
  );

  const updateQuantity = async (
    { cartItemId, quantity }: { cartItemId: string; quantity: number },
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
    const { revert } = checkoutLinesUpdate({
      lines: [{ lineId: cartItemId, quantity }],
    });
    return new Promise((resolve, reject) => {
      commit({
        variables: {
          input: {
            checkoutId: cartId,
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
          } else if (
            response?.checkoutMutation?.checkoutLinesUpdate?.errors &&
            response.checkoutMutation.checkoutLinesUpdate.errors.length > 0
          ) {
            revert();
            options?.onError?.();
            return reject(response.checkoutMutation.checkoutLinesUpdate.errors);
          } else {
            options?.onSuccess?.();
            return resolve(
              response?.checkoutMutation?.checkoutLinesUpdate?.checkout
            );
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
