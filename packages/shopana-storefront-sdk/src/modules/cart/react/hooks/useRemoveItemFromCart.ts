'use client';
import { resolveCartLineId } from '../../core/utils/resolveCartLineId';
import { useCartStoreApi, useCartSetters } from '../context/CartContext';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { removeFromCartMutation } from '../../core/graphql/mutations/removeFromCartMutation';
import { useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import type { MutationOptions, RemoveFromCartInput } from '../../core/types';
import type { model } from '../../../../model/namespace';
import {
  cartUserError,
  missingCheckoutError,
  settleCartMutation,
} from '../../core/errors';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
const useRemoveItemFromCart = () => {
  const { setCartKey, enqueueMutation, getConfirmedLineId } = useCartSetters();
  const cartStore = useCartStoreApi();
  const cartId = useCartIdOnly();

  const actions = useCartActions();
  const [commitRemoveLine, isInFlight] = useMutation(removeFromCartMutation);
  return {
    /**
     * Resolves with the confirmed cart, or null when there is no cart or the server has no
     * such line. Rejects only with `CartMutationError`.
     */
    removeFromCart: async (
      input: RemoveFromCartInput,
      options?: MutationOptions<model.Cart | null>
    ): Promise<model.Cart | null> => {
      // If no cart in cookie or context — just exit
      if (!cartId) {
        console.warn('[useRemoveItemFromCart] No cart to remove from');
        return null;
      }
      const purchasableId = cartStore.cart?.lines.find(
        (line) => line.id === input.lineId
      )?.purchasableId;
      const optimisticEdit = () => {
        const lineId = resolveCartLineId(
          cartStore.cart,
          input.lineId,
          purchasableId
        );
        if (lineId) actions.checkoutLinesDelete({ lineIds: [lineId] });
      };
      return settleCartMutation(
        enqueueMutation(
          () =>
            new Promise<model.Cart | null>((resolve, reject) => {
              const lineId = getConfirmedLineId(input.lineId, purchasableId);
              if (!lineId) return resolve(null);
              commitRemoveLine({
                variables: {
                  input: {
                    checkoutId: cartId,
                    lineIds: [lineId],
                  },
                },
                onCompleted: (response) => {
                  const payload = response.checkoutLinesDelete;
                  if (payload.errors.length > 0) {
                    return reject(cartUserError(payload.errors));
                  }
                  if (!payload.checkout) {
                    return reject(missingCheckoutError('checkoutLinesDelete'));
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
    },
    loading: isInFlight,
  };
};
export default useRemoveItemFromCart;
