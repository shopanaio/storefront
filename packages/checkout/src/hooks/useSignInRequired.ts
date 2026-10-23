import {
  useSessionExpired,
  useSessionStatus,
} from '@shopana/storefront-sdk/modules/session/react';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useIsCheckoutMissing } from '#checkout/hooks/useIsCheckoutMissing';
import { usePlacementPhase } from '#checkout/state/placement/placementStore';

/**
 * Whether the buyer signs in in place of the contact before anything else (A1–A2), while no
 * placement runs:
 * - S6: the session ended while the account checkout was open; it is not readable as a guest;
 * - S7: the store takes orders from accounts only and the buyer is not signed in.
 */
export function useSignInRequired(checkoutId: string | null): boolean {
  const phase = usePlacementPhase();
  const { checkout } = useCheckoutData();
  const missing = useIsCheckoutMissing(checkoutId);
  const sessionStatus = useSessionStatus();
  const sessionExpired = useSessionExpired();
  if (phase.name !== 'idle') return false;
  if (sessionExpired && !checkout && (missing || !checkoutId)) return true;
  return (
    checkout != null &&
    !checkout.guestCheckoutAllowed &&
    sessionStatus !== 'authenticated'
  );
}
