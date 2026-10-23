import { useMemo } from 'react';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useNow } from '#checkout/hooks/useNow';
import { checkoutReadiness } from '#checkout/state/readiness';
import type { CheckoutReadiness } from '#checkout/state/readiness';

/** Readiness of the loaded checkout; it turns expired on screen when `expiresAt` comes. */
export function useCheckoutReadiness(): CheckoutReadiness | null {
  const { checkout } = useCheckoutData();
  const now = useNow(checkout?.expiresAt);
  return useMemo(
    () => (checkout ? checkoutReadiness(checkout, now) : null),
    [checkout, now]
  );
}
