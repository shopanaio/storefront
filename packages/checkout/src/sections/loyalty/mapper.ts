import type { Checkout } from '#checkout/types/entity';
import type { LoyaltyFormData } from './types';

export function mapCheckoutToLoyaltyFormData(
  checkout: Checkout.Checkout | null
): LoyaltyFormData | null {
  if (!checkout) return null;
  return {
    signedIn: checkout.customerIdentity.customer !== null,
    redemption: checkout.loyaltyRedemption,
    selection: checkout.loyaltySelection,
  };
}
