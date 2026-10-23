import type { Checkout } from '#checkout/types/entity';

/** Data of the loyalty section: what the buyer chose and what the checkout applied. */
export interface LoyaltyFormData {
  /** A signed-in buyer; guests have no account to show. */
  signedIn: boolean;
  /** The redemption the latest calculation applied. */
  redemption: Checkout.LoyaltyRedemption | null;
  /** The saved choice, kept when the calculation could not apply it. */
  selection: Checkout.LoyaltySelection | null;
}
