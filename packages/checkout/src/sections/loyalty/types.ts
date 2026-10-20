import type { Checkout } from '#checkout/types/entity';

/** Data of the loyalty section: the selection the checkout holds. */
export interface LoyaltyFormData {
  /** A signed-in buyer; guests have no account to show. */
  signedIn: boolean;
  redemption: Checkout.LoyaltyRedemption | null;
  rewardId: string | null;
}
