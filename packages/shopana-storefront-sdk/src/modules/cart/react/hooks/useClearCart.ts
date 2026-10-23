'use client';
import { useMutation } from '../../../../graphql/apollo/hooks/useMutation';
import { clearCartMutation } from '../../core/graphql/mutations/clearCartMutation';
import { useCartSetters, useCartActions } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';
import type {
  ClearCartInput,
  MutationOptions,
  UseClearCartReturn,
} from '../../core/types';
import type { model } from '../../../../model/namespace';
import { cartUserError, settleCartMutation } from '../../core/errors';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
const useClearCart = (): UseClearCartReturn => {
  const cartId = useCartIdOnly();

  const { setCartKey, setId, enqueueMutation } = useCartSetters();
  const actions = useCartActions();
  const [commitClearCart, isInFlight] = useMutation(clearCartMutation);
  return {
    clearCart: async (
      input?: ClearCartInput,
      options?: MutationOptions<model.Cart | null>
    ): Promise<model.Cart | null> => {
      const currentCartId = input?.checkoutId || cartId;
      // If no cart in cookie or context — just exit
      if (!currentCartId) {
        console.warn('[useClearCart] No cart to clear');
        return null;
      }
      return settleCartMutation(
        enqueueMutation(
          () =>
            new Promise<model.Cart | null>((resolve, reject) => {
              commitClearCart({
                variables: {
                  input: {
                    checkoutId: currentCartId,
                  },
                },
                onCompleted: (response) => {
                  const payload = response.checkoutLinesClear;
                  if (payload.errors.length > 0) {
                    return reject(cartUserError(payload.errors));
                  }
                  const checkout = payload.checkout ?? null;
                  setCartKey(checkout);
                  // If checkout became null — remove cookie and clear context
                  if (!checkout) {
                    setId(null);
                  }
                  return resolve(
                    checkout ? mapShopanaCheckoutToEntityCart(checkout) : null
                  );
                },
                onError: reject,
              });
            }),
          {
            optimisticEdit: () => {
              actions.checkoutClear();
            },
          }
        ),
        options
      );
    },
    loading: isInFlight,
  };
};
export default useClearCart;
