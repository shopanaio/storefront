import type { Checkout } from '#checkout/types/entity';

/**
 * Form data type for the promo section: every promo code the buyer entered, with its state.
 */
export interface PromoFormData {
  codes: EnteredPromoCode[];
}

export interface EnteredPromoCode {
  code: string;
  status: Checkout.PromoCodeStatus;
  /** Message from the API about why the code is not applied; null if applied. */
  message: string | null;
}
