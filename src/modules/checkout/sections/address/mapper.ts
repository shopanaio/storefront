import type { Checkout } from '@src/modules/checkout/types/entity';
import type { AddressFormData } from './types';
import type { City } from '@src/modules/checkout/vendors/novaposta/types';

/**
 * Maps Checkout.Checkout entity to AddressFormData
 * Extracts delivery address from the first delivery group if available
 */
export function mapCheckoutToAddressFormData(
  checkout: Checkout.Checkout | null
): AddressFormData | null {
  if (!checkout) {
    return null;
  }

  const firstDeliveryGroup = checkout.deliveryGroups[0];
  if (!firstDeliveryGroup?.deliveryAddress) {
    return {
      addressId: null,
      city: null,
    };
  }

  const { deliveryAddress } = firstDeliveryGroup;

  // Parse city data from deliveryAddress.data
  const city: City | null = deliveryAddress.data
    ? // @ts-expect-error TODO: fix type
      (deliveryAddress?.data?.city as City)
    : null;

  return {
    addressId: deliveryAddress.id,
    city,
  };
}
