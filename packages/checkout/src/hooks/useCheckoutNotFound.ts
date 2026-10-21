import { useEffect, useRef } from 'react';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useRouter } from '@shopana/storefront/next/navigation';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useCheckoutTheme } from '#checkout/theme';
import { createAttemptJournal } from '#checkout/state/placement/attemptJournal';
import { useIsPlacementBusy } from '#checkout/state/placement/placementStore';
import { useSessionExpired } from '@shopana/storefront-sdk/modules/session/react';

/** Whether a load error says that the checkout does not exist (or is not readable). */
export function isCheckoutNotFoundError(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((item) => item.extensions?.code === 'NOT_FOUND')
  );
}

/**
 * Decision 5.3: a checkout that is not found sends the buyer to the cart. A checkout of this
 * browser's placement attempt is not "not found": it may be unreadable because it became an
 * order (decision 1.2), and the placement controller follows that placement instead.
 * Returns whether the checkout is missing, so the page does not wait for it forever.
 * After the session expired (S6) the account checkout is only unreadable, not gone: the page
 * asks to sign in again instead of leaving for the cart.
 */
export function useCheckoutNotFound(checkoutId: string | null): boolean {
  const { checkout, loaded, error } = useCheckoutData();
  const theme = useCheckoutTheme();
  const homePath = theme.useHomePath();
  const openCart = theme.useOpenCart();
  const router = useRouter();
  const placementBusy = useIsPlacementBusy();
  const sessionExpired = useSessionExpired();
  const handledRef = useRef<string | null>(null);
  const missing =
    Boolean(checkoutId) &&
    loaded &&
    !checkout &&
    (!error || isCheckoutNotFoundError(error)) &&
    !placementBusy &&
    !createAttemptJournal().read(checkoutId);

  useEffect(() => {
    if (!missing || sessionExpired || !checkoutId || handledRef.current === checkoutId) {
      return;
    }
    handledRef.current = checkoutId;
    router.replace(homePath);
    openCart?.();
  }, [missing, sessionExpired, checkoutId, router, homePath, openCart]);

  return missing;
}
