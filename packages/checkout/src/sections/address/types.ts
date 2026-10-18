import type { ProviderDeliveryAddress } from '#checkout/vendors/types';

/**
 * Form data type for the address section. One address goes to every delivery group (4.x):
 * the customer enters it once, whatever the split.
 */
export interface AddressFormData {
  /** Saved addresses of the groups; the backend may keep one per group. */
  addressIds: string[];
  /** Lines of the groups that have no address yet. */
  unaddressedLineIds: string[];
  /** Locale of the checkout; country names come localized for it. */
  localeCode: string;
  /** Country of the customer, preferred for a new address when the store delivers there. */
  customerCountryCode: string | null;
  /** Saved address of the groups, `null` until the customer enters one. */
  address: ProviderDeliveryAddress | null;
}
