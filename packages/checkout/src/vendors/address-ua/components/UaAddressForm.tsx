'use client';

import { useMemo } from 'react';
import type { AddressModuleProps } from '#checkout/vendors/types';
import {
  readSettlementRef,
  settlementAddressData,
} from '#checkout/vendors/nova-poshta/address';
import type { Settlement } from '#checkout/vendors/nova-poshta/types';
import { CitySelect, type PickedCity } from './CitySelect';
import { settlementProvinceCode } from '../provinceCode';

/**
 * Ukrainian address: the city comes first, the rest of the delivery data is entered in
 * the delivery method. The address keeps neutral fields only (country, province, city)
 * plus the Nova Poshta settlement as a carrier hint; the province tells apart settlements
 * of the same name. The directory has no postal code of a settlement yet.
 */
export function UaAddressForm({
  address,
  country,
  onSubmit,
}: AddressModuleProps) {
  const settlementRef = readSettlementRef(address);
  const cityName = address?.city ?? null;
  const provinceCode = address?.provinceCode ?? null;
  const { provinces } = country.addressFormat;
  const city = useMemo<PickedCity | null>(
    () =>
      cityName
        ? {
            name: cityName,
            settlementRef,
            area: provinceName(provinces, provinceCode, cityName),
          }
        : null,
    [cityName, settlementRef, provinces, provinceCode]
  );

  const handleSubmit = (settlement: Settlement) =>
    onSubmit({
      countryCode: 'UA',
      city: settlement.name,
      provinceCode: settlementProvinceCode(settlement),
      data: settlementAddressData(settlement),
    });

  return <CitySelect city={city} onSubmit={handleSubmit} />;
}

/** Cities with a code of their own, by the oblast around them (ISO 3166-2:UA, no prefix). */
const CITY_OBLAST: Record<string, string> = { '30': '32', '40': '43' };

/**
 * Oblast of the city as the store lists it in the address format, or `null` when unknown. A
 * city with a code of its own (Kyiv, Sevastopol) shows the oblast around it, as Nova Poshta
 * does, so the city never stands alone.
 */
function provinceName(
  provinces: readonly { code: string; name: string }[],
  code: string | null,
  city: string
): string | null {
  const bare = code?.replace(/^UA-/, '') ?? null;
  const oblast = bare ? (CITY_OBLAST[bare] ?? bare) : null;
  const name = provinces.find(
    (province) => province.code.replace(/^UA-/, '') === oblast
  )?.name;
  return name && name.trim().toLowerCase() !== city.trim().toLowerCase()
    ? name
    : null;
}
