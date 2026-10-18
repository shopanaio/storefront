'use client';

import { useMemo } from 'react';
import { ScopedIntlProvider } from '#checkout/ui/ScopedIntlProvider';
import type { AddressModuleProps } from '#checkout/vendors/types';
import {
  readSettlementRef,
  settlementAddressData,
} from '#checkout/vendors/nova-poshta/address';
import {
  loadNovaPoshtaMessages,
  NOVA_POSHTA_SCOPE,
} from '#checkout/vendors/nova-poshta/i18n';
import type { Settlement } from '#checkout/vendors/nova-poshta/types';
import { CitySelect, type PickedCity } from './CitySelect';
import { settlementProvinceCode } from '../provinceCode';

/**
 * Ukrainian address: the city comes first, the rest of the delivery data is entered in
 * the delivery method. The address keeps neutral fields only (country, province, city)
 * plus the Nova Poshta settlement as a carrier hint; the province tells apart settlements
 * of the same name. The directory has no postal code of a settlement yet.
 */
export function UaAddressForm({ address, onSubmit }: AddressModuleProps) {
  const settlementRef = readSettlementRef(address);
  const cityName = address?.city ?? null;
  const city = useMemo<PickedCity | null>(
    () => (cityName ? { name: cityName, settlementRef } : null),
    [cityName, settlementRef]
  );

  const handleSubmit = (settlement: Settlement) =>
    onSubmit({
      countryCode: 'UA',
      city: settlement.name,
      provinceCode: settlementProvinceCode(settlement),
      data: settlementAddressData(settlement),
    });

  return (
    <ScopedIntlProvider scope={NOVA_POSHTA_SCOPE} load={loadNovaPoshtaMessages}>
      <CitySelect city={city} onSubmit={handleSubmit} />
    </ScopedIntlProvider>
  );
}
