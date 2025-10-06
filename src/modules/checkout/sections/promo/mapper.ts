import type { Checkout } from '@src/modules/checkout/types/entity';
import type { PromoFormData } from './types';

/**
 * Maps Checkout.Checkout entity to PromoFormData
 * Extracts the first applied promo code if available
 */
export function mapCheckoutToPromoFormData(
  checkout: Checkout.Checkout | null
): PromoFormData | null {
  if (!checkout) {
    return null;
  }

  const firstPromoCode = checkout.appliedPromoCodes[0];

  if (!firstPromoCode) {
    return null;
  }

  return {
    code: firstPromoCode.code,
    provider: firstPromoCode.provider,
  };
}
