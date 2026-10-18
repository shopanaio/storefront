'use client';

import { useCallback, useEffect } from 'react';
import type { AddressFormData } from '../types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useRegisteredModule } from '#checkout/infra/useRegisteredModule';
import type {
  CheckoutDeliveryAddressInput,
  CountryCode,
} from '#checkout/graphql/operations';
import {
  ProviderModuleType,
  type AddressModuleApi,
  type AddressModuleValue,
} from '#checkout/vendors/types';
import { ADDRESS_SECTION_ANCHOR } from '../anchor';

export interface AddressSectionViewProps {
  /** Current form data */
  data: AddressFormData | null;
}

/** Address as the checkout API takes it: neutral fields and carrier hints in `data`. */
const toApiAddress = ({
  countryCode,
  ...address
}: AddressModuleValue): CheckoutDeliveryAddressInput => ({
  ...address,
  countryCode: countryCode as CountryCode,
});

/**
 * Address section: renders the address module registered for the country. The module
 * decides the fields; the section only saves what it submits.
 */
export const AddressSectionView = ({ data }: AddressSectionViewProps) => {
  const { updateDeliveryAddresses, addDeliveryAddresses } = useCheckoutApi();
  const addressIds = data?.addressIds;
  const unaddressedLineIds = data?.unaddressedLineIds;
  const countryCode = data?.countryCode ?? null;
  const { found, api } = useRegisteredModule<AddressModuleApi>(
    ProviderModuleType.Address,
    countryCode
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && countryCode && !found) {
      console.warn(
        `[checkout] No address module for country "${countryCode}"; the international form waits for the storefront address formats (B6).`
      );
    }
  }, [countryCode, found]);

  /**
   * The address goes to every delivery group: updated where saved, added where not. The
   * two mutations run one after the other: concurrent ones on the same checkout conflict
   * (`CHECKOUT_VERSION_CONFLICT`). A failure is already shown by the checkout API.
   */
  const onSubmit = useCallback(
    (value: AddressModuleValue) => {
      const address = toApiAddress(value);

      void (async () => {
        if (addressIds?.length) {
          await updateDeliveryAddresses({
            updates: addressIds.map((addressId) => ({ addressId, address })),
          });
        }
        if (unaddressedLineIds?.length || !addressIds?.length) {
          await addDeliveryAddresses({
            addresses: [{ address, checkoutLineIds: unaddressedLineIds ?? [] }],
          });
        }
      })().catch((error) => {
        console.error('Failed to save the delivery address:', error);
      });
    },
    [updateDeliveryAddresses, addDeliveryAddresses, addressIds, unaddressedLineIds]
  );

  if (!api) {
    return null;
  }

  const { Component } = api;
  return (
    <div id={ADDRESS_SECTION_ANCHOR}>
      <Component address={data?.address ?? null} onSubmit={onSubmit} />
    </div>
  );
};

export default AddressSectionView;
