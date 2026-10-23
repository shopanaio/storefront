import type { Checkout } from '#checkout/types/entity';
import type {
  DeliveryAddressesAddDto,
  DeliveryAddressesUpdateDto,
} from '#checkout/api/dto';
import type { CheckoutDeliveryAddressInput } from '#checkout/graphql/operations';
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
  const saved =
    groups.find((group) => group.deliveryAddress)?.deliveryAddress ?? null;
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
      ? unaddressed.flatMap((group) =>
          group.checkoutLines.map((line) => line.id)
        )
      : checkout.lines.map((line) => line.id);

  return {
    addressIds,
    unaddressedLineIds,
    localeCode: checkout.localeCode,
    customerCountryCode: checkout.customerIdentity.countryCode,
    address,
  };
}

/** Mutations that save one address for every delivery group, by the saved state. */
export interface AddressMutations {
  /** Saved addresses of the groups, updated in place. */
  update: DeliveryAddressesUpdateDto | null;
  /** Lines of the groups without an address; the first address goes to every line. */
  add: DeliveryAddressesAddDto | null;
}

/**
 * The address goes to every delivery group: updated where saved, added where not. Built from
 * the checkout as it is when the save starts, so an address added by the previous save is
 * updated, not added again.
 */
export function addressMutations(
  data: Pick<AddressFormData, 'addressIds' | 'unaddressedLineIds'>,
  address: CheckoutDeliveryAddressInput
): AddressMutations {
  const { addressIds, unaddressedLineIds } = data;
  return {
    update: addressIds.length
      ? { updates: addressIds.map((addressId) => ({ addressId, address })) }
      : null,
    add:
      unaddressedLineIds.length || !addressIds.length
        ? { addresses: [{ address, checkoutLineIds: unaddressedLineIds }] }
        : null,
  };
}
