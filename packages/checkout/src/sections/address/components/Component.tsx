'use client';

import { useCallback, useState } from 'react';
import { Button, Flex, Select, Skeleton, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import type { AddressFormData } from '../types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useRegisteredModule } from '#checkout/infra/useRegisteredModule';
import { useDeliveryCountries } from '#checkout/hooks/useDeliveryCountries';
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
import { pickDeliveryCountry } from '../countries';
import { InternationalAddressForm } from './InternationalAddressForm';

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
 * Address section (R4, B6). The country selector is shown only when the store delivers to more
 * than one country. The form is the address module registered for the country (Ukraine keeps
 * its city-first form); other countries get the form laid out by their address format.
 */
export const AddressSectionView = ({ data }: AddressSectionViewProps) => {
  const t = useTranslations('Checkout');
  const { updateDeliveryAddresses, addDeliveryAddresses } = useCheckoutApi();
  const addressIds = data?.addressIds;
  const unaddressedLineIds = data?.unaddressedLineIds;
  const savedAddress = data?.address ?? null;
  const savedCountryCode = savedAddress?.countryCode ?? null;
  const { countries, loading, error, refetch } = useDeliveryCountries(data?.localeCode ?? null);
  // A country picked in the selector; it holds while the saved address stays as it was.
  const [picked, setPicked] = useState<{ code: string; over: string | null } | null>(null);
  const pickedCountryCode = picked && picked.over === savedCountryCode ? picked.code : null;
  const countryCode =
    pickedCountryCode ??
    pickDeliveryCountry(countries, savedCountryCode, data?.customerCountryCode ?? null);
  const country = countries.find(({ code }) => code === countryCode) ?? null;
  const { found, api } = useRegisteredModule<AddressModuleApi>(
    ProviderModuleType.Address,
    countryCode
  );

  /**
   * The address goes to every delivery group: updated where saved, added where not. The
   * two mutations run one after the other: concurrent ones on the same checkout conflict.
   * A failure is already shown by the checkout API.
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

  if (error && countries.length === 0) {
    return (
      <Flex id={ADDRESS_SECTION_ANCHOR} vertical gap={8} align="flex-start">
        <Typography.Text type="danger">{t('delivery-countries-error')}</Typography.Text>
        <Button onClick={() => void refetch()}>{t('retry')}</Button>
      </Flex>
    );
  }
  // The anchor stays on the page in every state: validation scrolls to it.
  if (loading || (found && !api)) {
    return (
      <div id={ADDRESS_SECTION_ANCHOR}>
        <Skeleton.Input active block size="large" />
      </div>
    );
  }
  if (!country) {
    return (
      <Typography.Text id={ADDRESS_SECTION_ANCHOR} type="danger">
        {t('delivery-countries-empty')}
      </Typography.Text>
    );
  }

  const Form = api?.Component ?? InternationalAddressForm;
  return (
    <Flex id={ADDRESS_SECTION_ANCHOR} vertical gap={12}>
      {countries.length > 1 ? (
        <Select
          size="large"
          showSearch
          optionFilterProp="label"
          aria-label={t('country-region')}
          value={country.code}
          options={countries.map(({ code, name }) => ({ value: code, label: name }))}
          onChange={(code: string) => setPicked({ code, over: savedCountryCode })}
        />
      ) : null}
      <Form
        key={country.code}
        address={savedAddress && savedCountryCode === country.code ? savedAddress : null}
        country={country}
        onSubmit={onSubmit}
      />
    </Flex>
  );
};

export default AddressSectionView;
