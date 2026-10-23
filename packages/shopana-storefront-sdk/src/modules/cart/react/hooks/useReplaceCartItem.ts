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
 *     onError: (error) => console.error(error.kind, error.userErrors),
 *   }
 * );
 * ```
 */
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { replaceCartItemMutation } from '../../core/graphql/mutations/replaceCartItemMutation';
import { useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import type { MutationOptions, ReplaceCartItemInput } from '../../core/types';
import type { model } from '../../../../model/namespace';
import {
  cartUserError,
  missingCheckoutError,
  settleCartMutation,
} from '../../core/errors';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
const useReplaceCartItem = () => {
  const { setCartKey, enqueueMutation, getConfirmedLineId } = useCartSetters();
  const cartStore = useCartStoreApi();
  const cartId = useCartIdOnly();

  const actions = useCartActions();
  const [commit, isInFlight] = useMutation(replaceCartItemMutation);
  /**
   * Resolves with the confirmed cart, or null when there is no cart or the server has no such
   * line. Rejects only with `CartMutationError`.
   */
  const replaceCartItem = async (
    input: ReplaceCartItemInput,
    options?: MutationOptions<model.Cart | null>
  ): Promise<model.Cart | null> => {
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
    return settleCartMutation(
      enqueueMutation(
        () =>
          new Promise<model.Cart | null>((resolve, reject) => {
            const sourceLineId = getConfirmedLineId(
              lineId,
              sourcePurchasableId
            );
            if (!sourceLineId) return resolve(null);
            commit({
              variables: {
                input: {
                  checkoutId: cartId,
                  lines: [
                    {
                      lineId: sourceLineId,
                      purchasableId: purchasableId,
                      ...(quantity !== undefined && {
                        quantity: quantity,
                      }),
                    },
                  ],
                },
              },
              onCompleted: (response) => {
                const payload = response.checkoutLinesReplace;
                if (payload.errors.length > 0) {
                  return reject(cartUserError(payload.errors));
                }
                if (!payload.checkout) {
                  return reject(missingCheckoutError('checkoutLinesReplace'));
                }
                setCartKey(payload.checkout);
                return resolve(
                  mapShopanaCheckoutToEntityCart(payload.checkout)
                );
              },
              onError: reject,
            });
          }),
        { optimisticEdit }
      ),
      options
    );
  };
  return { replaceCartItem, loading: isInFlight };
};
export default useReplaceCartItem;
