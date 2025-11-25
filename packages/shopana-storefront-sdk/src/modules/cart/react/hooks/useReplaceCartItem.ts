/**
 * Hook for replacing cart items in Shopana checkout.
 *
 * This hook uses the `checkoutLinesReplace` mutation to move quantity from one cart line
 * to a different purchasable (product variant).
 * Useful when swapping product variants or replacing items in a cart.
 *
 * @example
 * ```tsx
 * const { replaceCartItem, loading } = useReplaceCartItem();
 *
 * await replaceCartItem(
 *   {
 *     lineId: "old-line-id",
 *     purchasableId: "new-purchasable-id",
 *     quantity: 2, // optional, if not provided moves all quantity
 *   },
 *   {
 *     onSuccess: () => console.log('Item replaced successfully'),
 *     onError: () => console.error('Failed to replace item'),
 *   }
 * );
 * ```
 */
"use client";

import { useMutation } from 'react-relay';
import type { replaceCartItemMutation as ReplaceCartItemMutationType } from '../../core/graphql/mutations/__generated__/replaceCartItemMutation.graphql';
import { replaceCartItemMutation } from '../../core/graphql/mutations/replaceCartItemMutation';

import { useCartActions, useCartConfig } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import { ReplaceCartItemInput } from '../../core/types';

const useReplaceCartItem = () => {
  const cartId = useCartIdOnly();
  const actions = useCartActions();
  const { defaultCurrency } = useCartConfig();
  const [commit, isInFlight] = useMutation<ReplaceCartItemMutationType>(
    replaceCartItemMutation
  );

  const replaceCartItem = async (
    input: ReplaceCartItemInput,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    const { lineId, purchasableId, purchasableSnapshot, quantity } = input;
    const { checkoutLinesReplace } = actions;
    if (!cartId) {
      console.warn('[useReplaceCartItem] No cart to replace items in');
      return null;
    }

    return new Promise((resolve, reject) => {
      const { revert } = checkoutLinesReplace({
        lines: [{ lineId, purchasableId, quantity }],
        pricing: {
          [purchasableId]: {
            unitPrice: purchasableSnapshot.price.amount,
            compareAtUnitPrice: purchasableSnapshot.compareAtPrice?.amount,
            currencyCode: purchasableSnapshot.price.currencyCode,
          },
        },
      });

      commit({
        variables: {
          input: {
            checkoutId: cartId,
            lines: [
              {
                lineId: lineId,
                purchasableId: purchasableId,
                ...(quantity !== undefined && {
                  quantity: quantity,
                }),
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
            response?.checkoutMutation?.checkoutLinesReplace?.errors &&
            response.checkoutMutation.checkoutLinesReplace.errors.length > 0
          ) {
            revert();
            options?.onError?.();
            return reject(
              response.checkoutMutation.checkoutLinesReplace.errors
            );
          } else {
            options?.onSuccess?.();
            return resolve(
              response?.checkoutMutation?.checkoutLinesReplace?.checkout
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

  return { replaceCartItem, loading: isInFlight };
};

export default useReplaceCartItem;
