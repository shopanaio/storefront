'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useApolloClient } from '@apollo/client/react';
import {
  SdkClaimCartMutationDocument,
  SdkLoadAccountCartQueryDocument,
  type SdkCartFragment_CartFragment,
} from '../../../../graphql/apollo/generated/operations';
import {
  useSessionContext,
  useSignInPending,
} from '../../../session/react/context/SessionContext';
import { useCartIdUtils, useCartSetters } from '../context/CartContext';

/** Dispatched on `window` after the account cart replaced or absorbed the guest cart. */
export const CART_CLAIMED_EVENT = 'shopana:cart-claimed';

export interface CartClaimedEventDetail {
  /** The account cart this browser continues with. */
  checkoutId: string;
  /** The guest checkout merged into it and closed (S2), if any. */
  mergedFromCheckoutId: string | null;
}

/**
 * Attaches the account cart after a sign-in (design F1, S1/S2/S4): a guest cart in this browser
 * is claimed by the account (passed over or merged into the saved account cart), otherwise the
 * saved account cart is read. Then every active query is read again, because prices and
 * profile data now follow the account. Also runs on request, e.g. after placement answered
 * `CHECKOUT_CLAIM_REQUIRED`.
 */
export function useClaimAccountCart() {
  const client = useApolloClient();
  const cartIdUtils = useCartIdUtils();
  const { setId, setCartKey, enqueueMutation, waitForMutations } =
    useCartSetters();

  return useCallback(async (): Promise<CartClaimedEventDetail | null> => {
    await waitForMutations();
    const guestCartId = cartIdUtils.getCartIdFromCookie();
    let checkout: SdkCartFragment_CartFragment | null = null;
    let mergedFromCheckoutId: string | null = null;
    if (guestCartId) {
      try {
        const result = await enqueueMutation(() =>
          client.mutate({
            mutation: SdkClaimCartMutationDocument,
            variables: { input: { checkoutId: guestCartId } },
          })
        );
        checkout = result.data?.checkoutClaim.checkout ?? null;
        mergedFromCheckoutId =
          result.data?.checkoutClaim.mergedFromCheckoutId ?? null;
      } catch {
        // The guest cart is gone or not this browser's: continue with the account cart.
      }
    }
    if (!checkout) {
      const { data } = await client.query({
        query: SdkLoadAccountCartQueryDocument,
        fetchPolicy: 'network-only',
      });
      checkout = data?.customer?.checkout ?? null;
    }
    if (!checkout) return null;
    setId(checkout.id);
    setCartKey(checkout);
    await client.refetchQueries({ include: 'active' });
    const detail: CartClaimedEventDetail = {
      checkoutId: checkout.id,
      mergedFromCheckoutId,
    };
    window.dispatchEvent(new CustomEvent(CART_CLAIMED_EVENT, { detail }));
    return detail;
  }, [client, cartIdUtils, enqueueMutation, setCartKey, setId, waitForMutations]);
}

/** Runs the account cart attachment once after each completed sign-in. */
export function AccountCartSync() {
  const signInPending = useSignInPending();
  const { store } = useSessionContext();
  const claim = useClaimAccountCart();
  const running = useRef(false);

  useEffect(() => {
    if (!signInPending || running.current) return;
    running.current = true;
    void claim()
      .catch(() => {
        // The cart stays as it is; checkout asks for the claim again before placing.
      })
      .finally(() => {
        running.current = false;
        store.getState().setSignInPending(false);
      });
  }, [signInPending, claim, store]);

  return null;
}
