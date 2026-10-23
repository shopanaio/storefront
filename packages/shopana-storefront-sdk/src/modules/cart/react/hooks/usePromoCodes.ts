'use client';

import { useMutation } from '@apollo/client/react';
import {
  SdkAddPromoCodeMutationDocument,
  SdkRemovePromoCodeMutationDocument,
  type SdkCartFragment_CartFragment,
} from '../../../../graphql/apollo/generated/operations';
import type { model } from '../../../../model/namespace';
import {
  cartUserError,
  missingCheckoutError,
  settleCartMutation,
  type CartUserError,
} from '../../core/errors';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
import { useCartSetters } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';

interface CheckoutPayload {
  readonly checkout?: SdkCartFragment_CartFragment | null;
  readonly userErrors: ReadonlyArray<
    Omit<CartUserError, 'field'> & { readonly field?: readonly string[] | null }
  >;
}

/**
 * Adds and removes promo codes of the cart. An entered code stays in `cart.promoCodes` with its
 * state (applied, pending or rejected) until the buyer removes it. Each call resolves with the
 * updated cart, or null when there is no cart, and rejects only with `CartMutationError`.
 */
export function usePromoCodes() {
  const checkoutId = useCartIdOnly();
  const { setCartKey } = useCartSetters();
  const [add, addState] = useMutation(SdkAddPromoCodeMutationDocument);
  const [remove, removeState] = useMutation(SdkRemovePromoCodeMutationDocument);

  const applyPayload = (
    payload: CheckoutPayload | undefined,
    operation: string
  ): model.Cart => {
    if (payload?.userErrors.length) throw cartUserError(payload.userErrors);
    if (!payload?.checkout) throw missingCheckoutError(operation);
    setCartKey(payload.checkout);
    return mapShopanaCheckoutToEntityCart(payload.checkout);
  };

  return {
    adding: addState.loading,
    removing: removeState.loading,
    async addPromoCode(code: string): Promise<model.Cart | null> {
      if (!checkoutId) {
        console.warn('[usePromoCodes] No cart to add the promo code to');
        return null;
      }
      return settleCartMutation(
        add({ variables: { input: { checkoutId, code } } }).then(({ data }) =>
          applyPayload(data?.checkoutPromoCodeAdd, 'checkoutPromoCodeAdd')
        )
      );
    },
    async removePromoCode(code: string): Promise<model.Cart | null> {
      if (!checkoutId) {
        console.warn('[usePromoCodes] No cart to remove the promo code from');
        return null;
      }
      return settleCartMutation(
        remove({ variables: { input: { checkoutId, code } } }).then(
          ({ data }) =>
            applyPayload(
              data?.checkoutPromoCodeRemove,
              'checkoutPromoCodeRemove'
            )
        )
      );
    },
  };
}

export default usePromoCodes;
