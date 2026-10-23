'use client';

import { useMutation } from '@apollo/client/react';
import {
  SdkLoyaltyRedemptionUpdateDocument,
  SdkLoyaltyRedemptionRemoveDocument,
  type CheckoutLoyaltyRedemptionUpdateInput,
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
 * Applies and removes the loyalty redemption of the cart. Each call resolves with the updated
 * cart, or null when there is no cart, and rejects only with `CartMutationError`.
 */
export function useLoyaltyRedemption() {
  const checkoutId = useCartIdOnly();
  const { setCartKey } = useCartSetters();
  const [update, updateState] = useMutation(SdkLoyaltyRedemptionUpdateDocument);
  const [remove, removeState] = useMutation(SdkLoyaltyRedemptionRemoveDocument);

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
    loading: updateState.loading || removeState.loading,
    error: updateState.error ?? removeState.error ?? null,
    async updateRedemption(
      input: Omit<CheckoutLoyaltyRedemptionUpdateInput, 'checkoutId'> = {}
    ): Promise<model.Cart | null> {
      if (!checkoutId) {
        console.warn('[useLoyaltyRedemption] No cart to redeem loyalty in');
        return null;
      }
      return settleCartMutation(
        update({ variables: { input: { ...input, checkoutId } } }).then(
          ({ data }) =>
            applyPayload(
              data?.checkoutLoyaltyRedemptionUpdate,
              'checkoutLoyaltyRedemptionUpdate'
            )
        )
      );
    },
    async removeRedemption(): Promise<model.Cart | null> {
      if (!checkoutId) {
        console.warn('[useLoyaltyRedemption] No cart to remove loyalty from');
        return null;
      }
      return settleCartMutation(
        remove({ variables: { input: { checkoutId } } }).then(({ data }) =>
          applyPayload(
            data?.checkoutLoyaltyRedemptionRemove,
            'checkoutLoyaltyRedemptionRemove'
          )
        )
      );
    },
  };
}
