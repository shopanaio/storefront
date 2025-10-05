import { useMemo } from 'react';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';

/**
 * Hook to get comment from checkout data.
 *
 * @returns Comment string or empty string if not set
 */
export function useCheckoutComment(): string {
  const checkoutData = useCheckoutData();

  return useMemo(() => {
    const comment = (
      checkoutData.cart as unknown as {
        comment?: string;
      } | null
    )?.comment;
    return comment || '';
  }, [checkoutData.cart]);
}
