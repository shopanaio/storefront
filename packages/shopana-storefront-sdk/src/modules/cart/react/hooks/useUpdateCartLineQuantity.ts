'use client';
import { resolveCartLineId } from '../../core/utils/resolveCartLineId';
import { useCartStoreApi, useCartSetters } from '../context/CartContext';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { updateCartLineQuantityMutation } from '../../core/graphql/mutations/updateCartLineQuantityMutation';
import { useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import type { MutationOptions } from '../../core/types';
import type { model } from '../../../../model/namespace';
import {
  cartUserError,
  missingCheckoutError,
  settleCartMutation,
} from '../../core/errors';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
const useUpdateCartLineQuantity = () => {
  const { setCartKey, enqueueMutation, getConfirmedLineId } = useCartSetters();
  const cartStore = useCartStoreApi();
  const cartId = useCartIdOnly();

  const actions = useCartActions();
  const [commit, isInFlight] = useMutation(updateCartLineQuantityMutation);
  /**
   * Resolves with the confirmed cart, or null when there is no cart or the server has no such
   * line. Rejects only with `CartMutationError`.
   */
  const updateQuantity = async (
    {
      cartItemId,
      quantity,
    }: {
      cartItemId: string;
      quantity: number;
    },
    options?: MutationOptions<model.Cart | null>
  ): Promise<model.Cart | null> => {
    const { checkoutLinesUpdate } = actions;
    if (!cartId) {
      console.warn('[useUpdateCartLineQuantity] No cart to update');
      return null;
    }
    const purchasableId = cartStore.cart?.lines.find(
      (line) => line.id === cartItemId
    )?.purchasableId;
    const optimisticEdit = () => {
      const lineId = resolveCartLineId(
        cartStore.cart,
        cartItemId,
        purchasableId
      );
      if (lineId) checkoutLinesUpdate({ lines: [{ lineId, quantity }] });
    };
    return settleCartMutation(
      enqueueMutation(
        () =>
          new Promise<model.Cart | null>((resolve, reject) => {
            const lineId = getConfirmedLineId(cartItemId, purchasableId);
            if (!lineId) return resolve(null);
            commit({
              variables: {
                input: {
                  checkoutId: cartId,
                  lines: [{ lineId, quantity }],
                },
              },
              onCompleted: (response) => {
                const payload = response.checkoutLinesUpdate;
                if (payload.errors.length > 0) {
                  return reject(cartUserError(payload.errors));
                }
                if (!payload.checkout) {
                  return reject(missingCheckoutError('checkoutLinesUpdate'));
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
  return { updateQuantity, loading: isInFlight };
};
export default useUpdateCartLineQuantity;
