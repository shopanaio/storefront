'use client';

import { useMutation } from '@apollo/client/react';
import {
  SdkAddPromoCodeMutationDocument,
  SdkRemovePromoCodeMutationDocument,
} from '../../../../graphql/apollo/generated/operations';
import { assertStorefrontMutationSucceeded } from '../../../storefront';
import { useCartSetters } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';

/**
 * Adds and removes promo codes of the cart. An entered code stays in `cart.promoCodes` with its
 * state (applied, pending or rejected) until the buyer removes it; a business error of the
 * mutation is thrown as `StorefrontMutationError`.
 */
export function usePromoCodes() {
  const checkoutId = useCartIdOnly();
  const { setCartKey } = useCartSetters();
  const [add, addState] = useMutation(SdkAddPromoCodeMutationDocument);
  const [remove, removeState] = useMutation(SdkRemovePromoCodeMutationDocument);

  const requireCheckoutId = () => {
    if (!checkoutId) throw new Error('Cart is unavailable');
    return checkoutId;
  };

  return {
    adding: addState.loading,
    removing: removeState.loading,
    async addPromoCode(code: string) {
      const { data } = await add({
        variables: { input: { checkoutId: requireCheckoutId(), code } },
      });
      if (!data) throw new Error('Promo code update returned no data');
      const payload = data.checkoutPromoCodeAdd;
      assertStorefrontMutationSucceeded(payload.userErrors);
      if (payload.checkout) setCartKey(payload.checkout);
      return payload.checkout ?? null;
    },
    async removePromoCode(code: string) {
      const { data } = await remove({
        variables: { input: { checkoutId: requireCheckoutId(), code } },
      });
      if (!data) throw new Error('Promo code removal returned no data');
      const payload = data.checkoutPromoCodeRemove;
      assertStorefrontMutationSucceeded(payload.userErrors);
      if (payload.checkout) setCartKey(payload.checkout);
      return payload.checkout ?? null;
    },
  };
}

export default usePromoCodes;
