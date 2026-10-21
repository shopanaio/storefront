'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button, Flex, Select, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import type { AddressFormData } from '../types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useRegisteredModule } from '#checkout/infra/useRegisteredModule';
import { useDeliveryCountries } from '#checkout/hooks/useDeliveryCountries';
import type {
  CheckoutDeliveryAddressInput,
  CountryCode,
} from '#checkout/graphql/operations';
import { closedCheckoutCode } from '#checkout/state/closedCheckout';
import {
  ProviderModuleType,
  type AddressModuleApi,
  type AddressModuleProps,
  type AddressModuleValue,
} from '#checkout/vendors/types';
import { hasModule } from '#checkout/infra/loadCache';
import { LoadingBoundary } from '#checkout/ui/LoadingBoundary';
import { ScopedIntlProvider } from '#checkout/ui/ScopedIntlProvider';
import { ADDRESS_SECTION_ANCHOR } from '../anchor';
import { pickDeliveryCountry, type DeliveryCountry } from '../countries';
import { AddressSkeleton } from './AddressSkeleton';
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
export const AddressSectionView = ({
  data,
  holdInvalid,
}: AddressSectionViewProps) => {
  const t = useTranslations('Checkout');
  const { saveDeliveryAddress } = useCheckoutApi();
  const savedAddress = data?.address ?? null;
  const savedCountryCode = savedAddress?.countryCode ?? null;
  const loaded = useDeliveryCountries(data?.localeCode ?? null);
  const { error, refetch } = loaded;
  // While the list is read again (another locale) the form keeps the list it was laid out
  // by: a skeleton in its place would drop what the buyer typed (BR-q7dr).
  const [lastCountries, setLastCountries] = useState(loaded.countries);
  if (loaded.countries.length > 0 && loaded.countries !== lastCountries) {
    setLastCountries(loaded.countries);
  }
  const reloading = loaded.loading && lastCountries.length > 0;
  const countries = reloading ? lastCountries : loaded.countries;
  const loading = loaded.loading && !reloading;
  // A country picked in the selector; it holds while the saved address stays as it was.
  const [picked, setPicked] = useState<{
    code: string;
    over: string | null;
  } | null>(null);
  const pickedCountryCode =
    picked && picked.over === savedCountryCode ? picked.code : null;
  // The country the form opened with stays while nothing is saved: the buyer country set
  // implicitly later (by a contact save) does not swap the form under the buyer (BR-q7dr).
  const [openedWith, setOpenedWith] = useState<string | null>(null);
  // Without the list of countries the section falls back to the Ukrainian form (see above).
  const noCountries = !loading && countries.length === 0;
  /**
   * A saved Ukrainian address is shown at once, while the list loads: its form needs no
   * address format, and the city comes with the checkout. The list then adds the country
   * selector, or moves the form to another country if the store no longer delivers to Ukraine.
   */
  const savedUkrainian = loading && savedCountryCode === FALLBACK_COUNTRY_CODE;
  const countryCode =
    noCountries || savedUkrainian
      ? FALLBACK_COUNTRY_CODE
      : (pickedCountryCode ??
        pickDeliveryCountry(
          countries,
          savedCountryCode,
          openedWith ?? data?.customerCountryCode ?? null
        ));
  // The form opens with the country the list picks, not with the one shown meanwhile.
  if (!openedWith && !noCountries && !savedUkrainian && countryCode) {
    setOpenedWith(countryCode);
  }
  const country =
    noCountries || savedUkrainian
      ? fallbackCountry(FALLBACK_COUNTRY_CODE)
      : (countries.find(({ code }) => code === countryCode) ?? null);
  const found =
    countryCode !== null && hasModule(ProviderModuleType.Address, countryCode);

  // The saved address belongs to another country than the form shows (picked in the selector,
  // or no longer delivered to): the order must not go to it until one is saved for this country.
  const countryMismatch =
    savedCountryCode !== null &&
    countryCode !== null &&
    savedCountryCode !== countryCode;

  /**
   * The last save failed; the form keeps what the buyer entered and says so (SC-nker). The
   * order waits until the address is saved: it would go to the old one (BR-awbl).
   */
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    holdInvalid?.(countryMismatch || saveFailed);
  }, [countryMismatch, saveFailed, holdInvalid]);

  /**
   * The address goes to every delivery group. Saves wait in the checkout mutation queue, and a
   * save still waiting there is replaced by the latest address.
   */
  /** The address being saved: leaving another field must not send it again. */
  const saving = useRef<string | null>(null);
  const onSubmit = useCallback(
    (value: AddressModuleValue) => {
      const key = JSON.stringify(value);
      if (saving.current === key) {
        return;
      }
      saving.current = key;
      saveDeliveryAddress(toApiAddress(value))
        .then(
          () => setSaveFailed(false),
          (failure: unknown) => {
            console.error('Failed to save the delivery address:', failure);
            // A closed checkout is handled for the whole checkout, not by the section.
            setSaveFailed(!closedCheckoutCode(failure));
          }
        )
        .finally(() => {
          if (saving.current === key) {
            saving.current = null;
          }
        });
    },
    [saveDeliveryAddress]
  );

  if (error && countries.length === 0 && !found) {
    return (
      <Flex id={ADDRESS_SECTION_ANCHOR} vertical gap={8} align="flex-start">
        <Typography.Text type="danger">
          {t('delivery-countries-error')}
        </Typography.Text>
        <Button onClick={() => void refetch()}>{t('retry')}</Button>
      </Flex>
    );
  }
  // A saved Ukrainian address does not wait for the list (see `savedUkrainian`).
  return (
    <LoadingBoundary
      pending={loading && !savedUkrainian}
      fallback={<AddressSkeleton />}
    >
      {!country || (noCountries && !found) ? (
        <Typography.Text id={ADDRESS_SECTION_ANCHOR} type="danger">
          {t('delivery-countries-empty')}
        </Typography.Text>
      ) : (
        <Flex id={ADDRESS_SECTION_ANCHOR} vertical gap={12}>
          {countries.length > 1 ? (
            <Select
              size="large"
              showSearch
              optionFilterProp="label"
              aria-label={t('country-region')}
              value={country.code}
              options={countries.map(({ code, name }) => ({
                value: code,
                label: name,
              }))}
              // The form of the country picked before stays until the new one has loaded.
              onChange={(code: string) =>
                startTransition(() =>
                  setPicked({ code, over: savedCountryCode })
                )
              }
            />
          ) : null}
          <AddressForm
            address={
              savedAddress && savedCountryCode === country.code
                ? savedAddress
                : null
            }
            country={country}
            onSubmit={onSubmit}
          />
          {saveFailed ? (
            <Typography.Text type="danger" role="alert">
              {t('error-save-address')}
            </Typography.Text>
          ) : null}
        </Flex>
      )}
    </LoadingBoundary>
  );
};

/**
 * The form of the country: the address module registered for it, with its messages, or the
 * form laid out by the country's address format. It suspends while the module loads.
 */
const AddressForm = (props: AddressModuleProps) => {
  const { api } = useRegisteredModule<AddressModuleApi>(
    ProviderModuleType.Address,
    props.country.code
  );
  if (!api) {
    return <InternationalAddressForm {...props} />;
  }
  const { Component: Form, messages } = api;
  return messages ? (
    <ScopedIntlProvider scope={messages.scope} load={messages.load}>
      <Form {...props} />
    </ScopedIntlProvider>
  ) : (
    <Form {...props} />
  );
};

export default AddressSectionView;
