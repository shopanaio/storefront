import type {
  CheckoutAddressField,
  CheckoutPostalCodeLabel,
  CheckoutProvinceLabel,
  StorefrontDeliveryCountriesQuery,
} from '#checkout/graphql/operations';

export type AddressField = CheckoutAddressField;

/** How an address is written in a country (B6). Labels are codes the storefront localizes. */
export interface AddressFormat {
  /** Rows of the form in display order; fields of one row share a line. */
  rows: AddressField[][];
  required: AddressField[];
  provinceLabel: CheckoutProvinceLabel | null;
  postalCodeLabel: CheckoutPostalCodeLabel | null;
  /** Case-insensitive pattern of a valid postal code, anchored at both ends. */
  postalCodePattern: string | null;
  postalCodeExample: string | null;
  /** Provinces to choose from; empty when the province is free text. */
  provinces: { code: string; name: string }[];
}

/** A country the store delivers to, with the address form used there. */
export interface DeliveryCountry {
  code: string;
  /** Localized by the API. */
  name: string;
  addressFormat: AddressFormat;
}

/**
 * Fields the address section owns. Name and phone belong to the recipient section, so the
 * address form leaves them out even where the country format lists them.
 */
export const ADDRESS_FIELDS: ReadonlySet<AddressField> = new Set([
  'ADDRESS1',
  'ADDRESS2',
  'CITY',
  'PROVINCE',
  'POSTAL_CODE',
]);

type ApiCountry = StorefrontDeliveryCountriesQuery['checkoutDeliveryCountries'][number];

export function mapDeliveryCountry(country: ApiCountry): DeliveryCountry {
  const format = country.addressFormat;
  return {
    code: country.code,
    name: country.name,
    addressFormat: {
      rows: format.rows.map((row) => [...row]),
      required: [...format.required],
      provinceLabel: format.provinceLabel ?? null,
      postalCodeLabel: format.postalCodeLabel ?? null,
      postalCodePattern: format.postalCodePattern ?? null,
      postalCodeExample: format.postalCodeExample ?? null,
      provinces: format.provinces.map(({ code, name }) => ({ code, name })),
    },
  };
}

/** Rows of the address form: the country rows without the fields of other sections. */
export function addressRows(format: AddressFormat): AddressField[][] {
  return format.rows
    .map((row) => row.filter((field) => ADDRESS_FIELDS.has(field)))
    .filter((row) => row.length > 0);
}

/**
 * Country of the address form: the country of the saved address, then the country of the
 * customer, then the first country the store delivers to. Only countries the store delivers to
 * are picked: a saved address in a country the store no longer delivers to gives way to another
 * country, so the buyer can enter an address the store can deliver to.
 */
export function pickDeliveryCountry(
  countries: readonly DeliveryCountry[],
  savedCountryCode: string | null,
  customerCountryCode: string | null
): string | null {
  const delivered = (code: string | null): code is string =>
    code !== null && countries.some((country) => country.code === code);
  if (delivered(savedCountryCode)) return savedCountryCode;
  if (delivered(customerCountryCode)) return customerCountryCode;
  return countries[0]?.code ?? null;
}

/** Whether a postal code matches the country pattern; without a pattern any value passes. */
export function isValidPostalCode(format: AddressFormat, value: string): boolean {
  if (!format.postalCodePattern) return true;
  try {
    return new RegExp(format.postalCodePattern, 'i').test(value.trim());
  } catch {
    return true;
  }
}
