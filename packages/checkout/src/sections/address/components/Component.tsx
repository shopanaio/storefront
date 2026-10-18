'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { pickDeliveryCountry, type DeliveryCountry } from '../countries';
import { InternationalAddressForm } from './InternationalAddressForm';

export interface AddressSectionViewProps {
  /** Current form data */
  data: AddressFormData | null;
  /** Marks the section invalid */
  invalidate: () => void;
  /** Keeps the section invalid while set */
  holdInvalid?: (held: boolean) => void;
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
 * Country whose form works without the list of delivery countries: its module lays out the
 * form itself. Used while that list failed to load or came back empty, so buyers from
 * Ukraine can still check out.
 */
const FALLBACK_COUNTRY_CODE = 'UA';

const fallbackCountry = (code: string): DeliveryCountry => ({
  code,
  name: code,
  addressFormat: {
    rows: [],
    required: [],
    provinceLabel: null,
    postalCodeLabel: null,
    postalCodePattern: null,
    postalCodeExample: null,
    provinces: [],
  },
});

/**
 * Address section (R4, B6). The country selector is shown only when the store delivers to more
 * than one country. The form is the address module registered for the country (Ukraine keeps
 * its city-first form); other countries get the form laid out by their address format.
 */
export const AddressSectionView = ({ data, holdInvalid }: AddressSectionViewProps) => {
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
  // Without the list of countries the section falls back to the Ukrainian form (see above).
  const noCountries = !loading && countries.length === 0;
  const countryCode = noCountries
    ? FALLBACK_COUNTRY_CODE
    : (pickedCountryCode ??
      pickDeliveryCountry(countries, savedCountryCode, data?.customerCountryCode ?? null));
  const country = noCountries
    ? fallbackCountry(FALLBACK_COUNTRY_CODE)
    : (countries.find(({ code }) => code === countryCode) ?? null);
  const { found, api } = useRegisteredModule<AddressModuleApi>(
    ProviderModuleType.Address,
    countryCode
  );

  // The saved address belongs to another country than the form shows (picked in the selector,
  // or no longer delivered to): the order must not go to it until one is saved for this country.
  const countryMismatch =
    savedCountryCode !== null && countryCode !== null && savedCountryCode !== countryCode;
  useEffect(() => {
    holdInvalid?.(countryMismatch);
  }, [countryMismatch, holdInvalid]);

  /** Latest saved state and API, read when a queued save starts, not when it was asked for. */
  const latest = useRef({
    addressIds,
    unaddressedLineIds,
    updateDeliveryAddresses,
    addDeliveryAddresses,
  });
  useEffect(() => {
    latest.current = {
      addressIds,
      unaddressedLineIds,
      updateDeliveryAddresses,
      addDeliveryAddresses,
    };
  });

  /** Saves run one at a time; only the latest address waiting for its turn is sent. */
  const queue = useRef<Promise<void>>(Promise.resolve());
  const pending = useRef<AddressModuleValue | null>(null);
  /** The address being saved now: blurring another field must not send it again. */
  const sending = useRef<string | null>(null);

  /**
   * The address goes to every delivery group: updated where saved, added where not. All
   * mutations run one after the other: concurrent ones on the same checkout conflict, and an
   * address added by one save must be updated, not added again, by the next one.
   * A failure is already shown by the checkout API.
   */
  const onSubmit = useCallback((value: AddressModuleValue) => {
    if (pending.current === null && sending.current === JSON.stringify(value)) {
      return;
    }
    const waiting = pending.current !== null;
    pending.current = value;
    if (waiting) {
      return;
    }

    queue.current = queue.current
      .then(async () => {
        // Let React commit the checkout the previous save returned, so the ids are fresh.
        await new Promise((resolve) => setTimeout(resolve, 0));
        const next = pending.current;
        pending.current = null;
        if (!next) {
          return;
        }
        sending.current = JSON.stringify(next);
        try {
          const address = toApiAddress(next);
          const { addressIds: ids, unaddressedLineIds: lineIds } = latest.current;
          if (ids?.length) {
            await latest.current.updateDeliveryAddresses({
              updates: ids.map((addressId) => ({ addressId, address })),
            });
          }
          if (lineIds?.length || !ids?.length) {
            await latest.current.addDeliveryAddresses({
              addresses: [{ address, checkoutLineIds: lineIds ?? [] }],
            });
          }
        } finally {
          sending.current = null;
        }
      })
      .catch((error) => {
        console.error('Failed to save the delivery address:', error);
      });
  }, []);

  if (error && countries.length === 0 && !found) {
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
  if (!country || (noCountries && !found)) {
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
