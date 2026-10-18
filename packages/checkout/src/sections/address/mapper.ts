import type { Checkout } from '#checkout/types/entity';
import type { AddressFormData } from './types';
import { toDeliveryAddress } from '#checkout/sections/delivery/mapper';

/**
 * Maps Checkout.Checkout entity to AddressFormData. The address is the same in every group;
 * the first saved one is shown. Updates go to the address of every group, and lines of
 * groups without one get it added.
 */
export function mapCheckoutToAddressFormData(
  checkout: Checkout.Checkout | null
): AddressFormData | null {
  if (!checkout) {
    return null;
  }

  const groups = checkout.deliveryGroups;
  const saved = groups.find((group) => group.deliveryAddress)?.deliveryAddress ?? null;
  const address = toDeliveryAddress(saved);
  const addressIds = [
    ...new Set(
      groups.flatMap((group) =>
        group.deliveryAddress?.id ? [group.deliveryAddress.id] : []
      )
    ),
  ];
  const unaddressed = groups.filter((group) => !group.deliveryAddress?.id);
  const unaddressedLineIds =
    groups.length > 0
      ? unaddressed.flatMap((group) => group.checkoutLines.map((line) => line.id))
      : checkout.lines.map((line) => line.id);

  return {
    addressIds,
    unaddressedLineIds,
    localeCode: checkout.localeCode,
    customerCountryCode: checkout.customerIdentity.countryCode,
    address,
  };
}
