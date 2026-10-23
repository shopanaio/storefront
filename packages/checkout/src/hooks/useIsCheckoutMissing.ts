import { CombinedGraphQLErrors } from '@apollo/client';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { createAttemptJournal } from '#checkout/state/placement/attemptJournal';
import { useIsPlacementBusy } from '#checkout/state/placement/placementStore';

/** Whether a load error says that the checkout does not exist (or is not readable). */
export function isCheckoutNotFoundError(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((item) => item.extensions?.code === 'NOT_FOUND')
  );
}

/**
 * Whether the checkout is missing: read, and not there (or not readable). A checkout of this
 * browser's placement attempt is not missing: it may be unreadable because it became an order
 * (decision 1.2), and the placement controller follows that placement instead.
 */
export function useIsCheckoutMissing(checkoutId: string | null): boolean {
  const { checkout, loaded, error } = useCheckoutData();
  const placementBusy = useIsPlacementBusy();
  return (
    Boolean(checkoutId) &&
    loaded &&
    !checkout &&
    (!error || isCheckoutNotFoundError(error)) &&
    !placementBusy &&
    !createAttemptJournal().read(checkoutId)
  );
}
