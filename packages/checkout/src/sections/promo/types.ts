/**
 * Form data type for the promo section: every promo code the checkout applies (6.3).
 */
export interface PromoFormData {
  codes: AppliedPromoCode[];
}

export interface AppliedPromoCode {
  code: string;
  provider: string;
}
