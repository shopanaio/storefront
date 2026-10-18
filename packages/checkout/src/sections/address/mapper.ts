import type { Checkout } from '#checkout/types/entity';
import type { AddressFormData } from './types';
import { toDeliveryAddress } from '#checkout/sections/delivery/mapper';

/**
 * Country of a new address. The storefront API does not list delivery countries yet
 * (B6), so the only supported country is the default one and no selector is shown.
 */
export const DEFAULT_DELIVERY_COUNTRY = 'UA';

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
  const address = toDeliveryAddress(firstDeliveryGroup?.deliveryAddress ?? null);

  return {
    addressId: address?.addressId ?? null,
    checkoutLineIds:
      firstDeliveryGroup?.checkoutLines.map((line) => line.id) ?? [],
    countryCode: address?.countryCode ?? DEFAULT_DELIVERY_COUNTRY,
    address,
  };
}
