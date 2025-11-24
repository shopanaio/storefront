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

import { graphql, useMutation } from 'react-relay';
import { useReplaceCartItemMutation as ReplaceCartItemMutationType } from '../../core/graphql/mutations/__generated__/useReplaceCartItemMutation.graphql';
// @ts-ignore - TODO: Phase 2 - Move useCurrencyStore to SDK
import { useCurrencyStore } from '@src/store/appStore';
// @ts-ignore - TODO: Phase 2 - Move useCartStore to SDK
import { useCartStore } from '@src/store/cartStore';

import { ReplaceCartItemInput } from '../../core/types';

export const useReplaceCartItemMutation = graphql`
  mutation useReplaceCartItemMutation($input: CheckoutLinesReplaceInput!) {
    checkoutMutation {
      checkoutLinesReplace(input: $input) {
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

const useReplaceCartItem = () => {
  const { currencyCode } = useCurrencyStore.getState();
  const [commit, isInFlight] = useMutation<ReplaceCartItemMutationType>(
    useReplaceCartItemMutation
  );

  const replaceCartItem = async (
    input: ReplaceCartItemInput,
    options?: {
      onSuccess?: () => void;
      onError?: () => void;
    }
  ) => {
    const { lineId, purchasableId, purchasableSnapshot, quantity } = input;
    const { cart, checkoutLinesReplace } = useCartStore.getState();
    const cartId = cart?.id;
    if (!cartId || !cart?.id) {
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
            currencyCode,
          },
        },
      });

      commit({
        variables: {
          input: {
            checkoutId: cart.id,
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
