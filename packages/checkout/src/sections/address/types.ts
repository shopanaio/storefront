import type { City } from '#checkout/sections/address/components/city/CitySelect';

/**
 * Form data type for the address section
 */
export interface AddressFormData {
  addressId: string | null;
  checkoutLineIds: string[];
  city: City | null;
}
