/**
 * Checkout configuration by country.
 * Extend to support different countries and UI variations.
 */
export type CheckoutCountry = 'UA' | 'INTL';

export interface CheckoutConfig {
  /** The primary country mode controlling checkout UI. */
  country: CheckoutCountry;
}

/**
 * Default checkout configuration.
 * Note: later this can be loaded from CMS or environment.
 */
export const checkoutConfig: CheckoutConfig = {
  country: 'UA',
};

/**
 * Returns current checkout country mode.
 */
export function getCheckoutCountry(): CheckoutCountry {
  return checkoutConfig.country;
}
