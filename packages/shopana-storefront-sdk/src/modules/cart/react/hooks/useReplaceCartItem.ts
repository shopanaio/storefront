'use client';
import { resolveCartLineId } from '../../core/utils/resolveCartLineId';
import { useCartStoreApi, useCartSetters } from '../context/CartContext';
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
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { replaceCartItemMutation } from '../../core/graphql/mutations/replaceCartItemMutation';
import { useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import { ReplaceCartItemInput } from '../../core/types';
const useReplaceCartItem = () => {
  const { setCartKey, enqueueMutation, getConfirmedLineId } = useCartSetters();
  const cartStore = useCartStoreApi();
  const cartId = useCartIdOnly();

  const actions = useCartActions();
  const [commit, isInFlight] = useMutation(replaceCartItemMutation);
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
    const sourcePurchasableId = cartStore.cart?.lines.find(
      (line) => line.id === lineId
    )?.purchasableId;
    const optimisticEdit = () => {
      const optimisticLineId = resolveCartLineId(
        cartStore.cart,
        lineId,
        sourcePurchasableId
      );
      if (!optimisticLineId) return;
      checkoutLinesReplace({
        lines: [{ lineId: optimisticLineId, purchasableId, quantity }],
        pricing: {
          [purchasableId]: {
            unitPrice: purchasableSnapshot.price.amount,
            compareAtUnitPrice: purchasableSnapshot.compareAtPrice?.amount,
            currencyCode: purchasableSnapshot.price.currencyCode,
          },
        },
      });
    };
    return enqueueMutation(
      () =>
        new Promise((resolve, reject) => {
          commit({
            variables: {
              input: {
                checkoutId: cartId,
                lines: [
                  {
                    lineId: getConfirmedLineId(lineId, sourcePurchasableId),
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
                options?.onError?.();
                return reject(errors);
              } else if (response.checkoutLinesReplace.errors.length > 0) {
                options?.onError?.();
                return reject(response.checkoutLinesReplace.errors);
              } else {
                setCartKey(response.checkoutLinesReplace.checkout);
                options?.onSuccess?.();
                return resolve(response.checkoutLinesReplace.checkout);
              }
            },
            onError: (err) => {
              options?.onError?.();
              return reject(err);
            },
          });
        }),
      { optimisticEdit }
    );
  };
  return { replaceCartItem, loading: isInFlight };
};
export default useReplaceCartItem;
