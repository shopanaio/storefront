'use client';
import { resolveCartLineId } from '../../core/utils/resolveCartLineId';
import { useCartStoreApi, useCartSetters } from '../context/CartContext';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { removeFromCartMutation } from '../../core/graphql/mutations/removeFromCartMutation';
import { useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import { RemoveFromCartInput } from '../../core/types';
const useRemoveItemFromCart = () => {
  const { setCartKey, enqueueMutation, getConfirmedLineId } = useCartSetters();
  const cartStore = useCartStoreApi();
  const cartId = useCartIdOnly();

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
      return enqueueMutation(
        () =>
          new Promise((resolve, reject) => {
            commitRemoveLine({
              variables: {
                input: {
                  checkoutId: cartId,
                  lineIds: [getConfirmedLineId(input.lineId, purchasableId)],
                },
              },
              onCompleted: (response, errors) => {
                if (errors && errors.length > 0) {
                  options?.onError?.();
                  return reject(errors);
                } else if (response.checkoutLinesDelete.errors.length > 0) {
                  options?.onError?.();
                  return reject(response.checkoutLinesDelete.errors);
                } else {
                  setCartKey(response.checkoutLinesDelete.checkout);
                  options?.onSuccess?.();
                  return resolve(response);
                }
              },
              onError: (err) => {
                options?.onError?.();
                return reject(err);
              },
            });
          }),
        optimisticEdit
      );
    },
    loading: isInFlight,
  };
};
export default useRemoveItemFromCart;
