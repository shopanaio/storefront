import { useEffect, useRef } from 'react';
import { useClaimAccountCart } from '@shopana/storefront-sdk/modules/cart/react';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { usePlacementPhase } from '#checkout/state/placement/placementStore';
import {
  CLAIM_REQUIRED_CODE,
  GUEST_NOT_ALLOWED_CODE,
} from '#checkout/state/placement/outcome';

/**
 * Follows a placement refused for the buyer's account state (B6, S7):
 * - `CHECKOUT_CLAIM_REQUIRED`: the buyer signed in but this guest checkout is not the
 *   account's yet; the account claims it (or merges it into its cart) and every read follows
 *   with the account prices;
 * - `CHECKOUT_GUEST_NOT_ALLOWED`: the read shows the guest may not continue, and the page asks
 *   to sign in.
 */
export function useAccountRecovery() {
  const phase = usePlacementPhase();
  const claimAccountCart = useClaimAccountCart();
  const { refetch } = useCheckoutData();
  const handled = useRef<unknown>(null);

  useEffect(() => {
    if (phase.name !== 'rejected' || handled.current === phase) return;
    handled.current = phase;
    if (phase.code === CLAIM_REQUIRED_CODE) {
      void claimAccountCart().catch(() => undefined);
    } else if (phase.code === GUEST_NOT_ALLOWED_CODE) {
      void refetch().catch(() => undefined);
    }
  }, [phase, claimAccountCart, refetch]);
}
