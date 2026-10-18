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
  /** Country whose address module renders the form. */
  countryCode: string;
  /** Saved address of the groups, `null` until the customer enters one. */
  address: ProviderDeliveryAddress | null;
}
