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

export interface AddressSectionViewProps {
  /** Current form data */
  data: AddressFormData | null;
}

/**
 * Address as the checkout API takes it today. B9 renames `zip` to `postalCode` and makes
 * `address1` optional; until then the backend rejects an address without `address1`.
 */
const toApiAddress = ({
  postalCode,
  countryCode,
  ...address
}: AddressModuleValue): CheckoutDeliveryAddressInput => ({
  ...address,
  countryCode: countryCode as CountryCode,
  ...(postalCode ? { zip: postalCode } : {}),
});

/**
 * Address section: renders the address module registered for the country. The module
 * decides the fields; the section only saves what it submits.
 */
export const AddressSectionView = ({ data }: AddressSectionViewProps) => {
  const { updateDeliveryAddresses, addDeliveryAddresses } = useCheckoutApi();
  const addressId = data?.addressId;
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

  const onSubmit = useCallback(
    (value: AddressModuleValue) => {
      const address = toApiAddress(value);

      if (!addressId) {
        addDeliveryAddresses({
          addresses: [
            {
              address,
              checkoutLineIds: data?.checkoutLineIds ?? [],
            },
          ],
        });
        return;
      }

      updateDeliveryAddresses({
        updates: [{ addressId, address }],
      });
    },
    [updateDeliveryAddresses, addressId, addDeliveryAddresses, data?.checkoutLineIds]
  );

  if (!api) {
    return null;
  }

  const { Component } = api;
  return <Component address={data?.address ?? null} onSubmit={onSubmit} />;
};

export default AddressSectionView;
