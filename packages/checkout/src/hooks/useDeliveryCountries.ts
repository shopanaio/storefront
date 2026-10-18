import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { deliveryCountriesQuery } from '#checkout/api/queries/deliveryCountriesQuery.shopana';
import { mapDeliveryCountry } from '#checkout/sections/address/countries';
import type { DeliveryCountry } from '#checkout/sections/address/countries';

/** Countries the store delivers to (B6), with country names in the checkout locale. */
export function useDeliveryCountries(localeCode: string | null): {
  countries: DeliveryCountry[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
} {
  const { data, loading, error, refetch } = useQuery(deliveryCountriesQuery, {
    variables: { localeCode },
    skip: !localeCode,
  });
  const countries = useMemo(
    () => (data?.checkoutDeliveryCountries ?? []).map(mapDeliveryCountry),
    [data]
  );
  return {
    countries,
    loading: loading || (!data && !error),
    error: error ?? null,
    refetch,
  };
}
