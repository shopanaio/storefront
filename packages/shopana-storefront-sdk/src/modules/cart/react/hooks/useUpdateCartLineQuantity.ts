'use client';
import { resolveCartLineId } from '../../core/utils/resolveCartLineId';
import { useCartStoreApi, useCartSetters } from '../context/CartContext';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { updateCartLineQuantityMutation } from '../../core/graphql/mutations/updateCartLineQuantityMutation';
import { useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
const useUpdateCartLineQuantity = () => {
  const { setCartKey, enqueueMutation, getConfirmedLineId } = useCartSetters();
  const cartStore = useCartStoreApi();
  const cartId = useCartIdOnly();

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
    return enqueueMutation(
      () =>
        new Promise((resolve, reject) => {
          commit({
            variables: {
              input: {
                checkoutId: cartId,
                lines: [
                  {
                    lineId: getConfirmedLineId(cartItemId, purchasableId),
                    quantity,
                  },
                ],
              },
            },
            onCompleted: (response, errors) => {
              if (errors && errors.length > 0) {
                options?.onError?.();
                return reject(errors);
              } else if (response.checkoutLinesUpdate.errors.length > 0) {
                options?.onError?.();
                return reject(response.checkoutLinesUpdate.errors);
              } else {
                setCartKey(response.checkoutLinesUpdate.checkout);
                options?.onSuccess?.();
                return resolve(response.checkoutLinesUpdate.checkout);
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
  return { updateQuantity, loading: isInFlight };
};
export default useUpdateCartLineQuantity;
