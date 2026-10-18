import type { ProviderDeliveryAddress } from '#checkout/vendors/types';

/**
 * Form data type for the address section
 */
export interface AddressFormData {
  addressId: string | null;
  checkoutLineIds: string[];
  /** Country whose address module renders the form. */
  countryCode: string;
  /** Saved address of the group, `null` until the customer enters one. */
  address: ProviderDeliveryAddress | null;
}
