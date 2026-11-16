import type { Checkout } from '#checkout/types/entity';
import type { PromoFormData } from './types';

/**
 * Maps Checkout.Checkout entity to PromoFormData: the entered promo codes, in API order. A
 * rejected code is left out: it does not belong in the checkout.
 */
export function mapCheckoutToPromoFormData(
  checkout: Checkout.Checkout | null
): PromoFormData | null {
  if (!checkout) {
    return null;
  }
  return {
    codes: checkout.promoCodes
      .filter(({ status }) => status !== 'REJECTED')
      .map(({ code, status, message }) => ({ code, status, message })),
  };
}
