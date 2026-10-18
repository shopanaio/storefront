import type { Checkout } from '#checkout/types/entity';
import type { PromoFormData } from './types';

/** Maps Checkout.Checkout entity to PromoFormData: all applied promo codes, in API order. */
export function mapCheckoutToPromoFormData(
  checkout: Checkout.Checkout | null
): PromoFormData | null {
  if (!checkout) {
    return null;
  }
  return {
    codes: checkout.appliedPromoCodes.map(({ code, provider }) => ({ code, provider })),
  };
}
