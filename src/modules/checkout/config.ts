import type { ComponentType } from 'react';
import { ContactSection } from '@checkout/sections/contact/components/ContactSection';
import { RecipientSection } from '@checkout/sections/recipient/components/RecipientSection';
import { AddressSection } from '@checkout/sections/delivery/components/AddressSection';
import { DeliverySection } from '@checkout/sections/delivery/components/DeliverySection';
import { PaymentSection } from '@checkout/sections/payment/components/PaymentSection';

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

/**
 * Centralized sections configuration.
 * All sections are defined here.
 */
export const sectionsConfig = {
  contact: ContactSection,
  recipient: RecipientSection,
  address: AddressSection,
  delivery: DeliverySection,
  payment: PaymentSection,
} as const satisfies Record<string, ComponentType<any>>;

/**
 * Get component for specific section.
 */
export function getSectionComponent(
  section: keyof typeof sectionsConfig
): ComponentType<any> {
  return sectionsConfig[section];
}
