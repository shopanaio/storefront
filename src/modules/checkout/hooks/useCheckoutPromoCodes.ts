import { useMemo } from 'react';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import type { ApiCheckoutPromoCode } from '@codegen/schema-client';

/**
 * Hook to get applied promo codes from checkout data.
 *
 * @returns Array of applied promo codes or empty array if none applied
 */
export function useCheckoutPromoCodes(): ApiCheckoutPromoCode[] {
  const checkoutData = useCheckoutData();

  return useMemo(() => {
    const promoCodes = (
      checkoutData.cart as unknown as {
        appliedPromoCodes?: ApiCheckoutPromoCode[];
      } | null
    )?.appliedPromoCodes;
    return Array.isArray(promoCodes) ? promoCodes : [];
  }, [checkoutData.cart]);
}

/**
 * Hook to get the first applied promo code (if any).
 *
 * @returns First applied promo code or null
 */
export function useCheckoutPromoCode(): ApiCheckoutPromoCode | null {
  const promoCodes = useCheckoutPromoCodes();
  return promoCodes.length > 0 ? promoCodes[0] : null;
}
