import type { City } from '@src/modules/checkout/sections/delivery/components/city/CitySelect';

/**
 * Form data type for the address section
 */
export interface AddressFormData {
  city: City | null;
}
