'use client';

import { useMutation } from '@apollo/client/react';
import {
  SdkLoyaltyRedemptionUpdateDocument,
  SdkLoyaltyRedemptionRemoveDocument,
  type CheckoutLoyaltyRedemptionUpdateInput,
} from '../../../../graphql/apollo/generated/operations';
import { assertStorefrontMutationSucceeded } from '../../../storefront';
import { useCartSetters } from '../context/CartContext';
import { useCartIdOnly } from './useCartSelectors';

export function useLoyaltyRedemption() {
  const checkoutId = useCartIdOnly();
  const { setCartKey } = useCartSetters();
  const [update, updateState] = useMutation(SdkLoyaltyRedemptionUpdateDocument);
  const [remove, removeState] = useMutation(SdkLoyaltyRedemptionRemoveDocument);

  const requireCheckoutId = () => {
    if (!checkoutId) throw new Error('Cart is unavailable');
    return checkoutId;
  };

  return {
    loading: updateState.loading || removeState.loading,
    error: updateState.error ?? removeState.error ?? null,
    async updateRedemption(
      input: Omit<CheckoutLoyaltyRedemptionUpdateInput, 'checkoutId'> = {}
    ) {
      const { data } = await update({
        variables: { input: { ...input, checkoutId: requireCheckoutId() } },
      });
      if (!data) throw new Error('Loyalty update returned no data');
      const payload = data.checkoutLoyaltyRedemptionUpdate;
      assertStorefrontMutationSucceeded(payload.userErrors);
      if (payload.checkout) setCartKey(payload.checkout);
      return payload.checkout ?? null;
    },
    async removeRedemption() {
      const { data } = await remove({
        variables: { input: { checkoutId: requireCheckoutId() } },
      });
      if (!data) throw new Error('Loyalty removal returned no data');
      const payload = data.checkoutLoyaltyRedemptionRemove;
      assertStorefrontMutationSucceeded(payload.userErrors);
      if (payload.checkout) setCartKey(payload.checkout);
      return payload.checkout ?? null;
    },
  };
}
