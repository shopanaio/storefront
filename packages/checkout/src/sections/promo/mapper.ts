import type { Checkout } from '#checkout/types/entity';
import type { PromoFormData } from './types';

/** Maps Checkout.Checkout entity to PromoFormData: every entered promo code, in API order. */
export function mapCheckoutToPromoFormData(
  checkout: Checkout.Checkout | null
): PromoFormData | null {
  if (!checkout) {
    return null;
  }
  return {
    codes: checkout.promoCodes.map(({ code, status, message }) => ({ code, status, message })),
  };
}
