import { describe, expect, it } from 'vitest';
import {
  addressRows,
  isValidPostalCode,
  mapDeliveryCountry,
  pickDeliveryCountry,
} from './countries';
import type { AddressFormat, DeliveryCountry } from './countries';
import {
  addressErrors,
  toAddressValue,
} from './components/InternationalAddressForm';

const us: AddressFormat = {
  rows: [
    ['FIRST_NAME', 'LAST_NAME'],
    ['ADDRESS1'],
    ['ADDRESS2'],
    ['CITY'],
    ['PROVINCE', 'POSTAL_CODE'],
    ['PHONE'],
  ],
  required: [
    'FIRST_NAME',
    'LAST_NAME',
    'ADDRESS1',
    'CITY',
    'PROVINCE',
    'POSTAL_CODE',
  ],
  provinceLabel: 'STATE',
  postalCodeLabel: 'ZIP_CODE',
  postalCodePattern: '^\\d{5}(-\\d{4})?$',
  postalCodeExample: '94043',
  provinces: [{ code: 'CA', name: 'California' }],
};
const country = (code: string): DeliveryCountry => ({
  code,
  name: code,
  addressFormat: us,
});
const values = {
  FIRST_NAME: '',
  LAST_NAME: '',
  ADDRESS1: ' 1600 Amphitheatre Pkwy ',
  ADDRESS2: '',
  CITY: 'Mountain View',
  PROVINCE: 'CA',
  POSTAL_CODE: '94043',
  PHONE: '',
};

describe('delivery countries', () => {
  it('maps the API country', () => {
    expect(
      mapDeliveryCountry({
        __typename: 'CheckoutDeliveryCountry',
        code: 'US',
        name: 'United States',
        addressFormat: {
          __typename: 'CheckoutAddressFormat',
          ...us,
          provinces: [
            {
              __typename: 'CheckoutAddressProvince',
              code: 'CA',
              name: 'California',
            },
          ],
        },
      })
    ).toEqual({ code: 'US', name: 'United States', addressFormat: us });
  });

  it('leaves name and phone to the recipient section', () => {
    expect(addressRows(us)).toEqual([
      ['ADDRESS1'],
      ['ADDRESS2'],
      ['CITY'],
      ['PROVINCE', 'POSTAL_CODE'],
    ]);
  });

  it('picks the saved country, then the customer country, then the first one', () => {
    const countries = [country('PL'), country('US')];
    expect(pickDeliveryCountry(countries, 'US', 'PL')).toBe('US');
    expect(pickDeliveryCountry(countries, null, 'US')).toBe('US');
    expect(pickDeliveryCountry(countries, null, 'DE')).toBe('PL');
    expect(pickDeliveryCountry([], null, null)).toBeNull();
  });

  it('gives up the saved country when the store no longer delivers there', () => {
    const countries = [country('PL'), country('US')];
    expect(pickDeliveryCountry(countries, 'UA', 'US')).toBe('US');
    expect(pickDeliveryCountry(countries, 'UA', null)).toBe('PL');
    expect(pickDeliveryCountry([], 'UA', null)).toBeNull();
  });

  it('checks the postal code by the country pattern', () => {
    expect(isValidPostalCode(us, '94043-1351')).toBe(true);
    expect(isValidPostalCode(us, 'SW1A 1AA')).toBe(false);
    expect(
      isValidPostalCode({ ...us, postalCodePattern: null }, 'anything')
    ).toBe(true);
  });
});

describe('international address form', () => {
  it('reports missing required fields and an invalid postal code', () => {
    expect(
      addressErrors(us, { ...values, CITY: ' ', POSTAL_CODE: '123' })
    ).toEqual({
      CITY: 'required',
      POSTAL_CODE: 'invalid',
    });
    expect(addressErrors(us, values)).toEqual({});
  });

  it('sends neutral fields only, trimmed', () => {
    expect(toAddressValue('US', us, values)).toEqual({
      countryCode: 'US',
      city: 'Mountain View',
      address1: '1600 Amphitheatre Pkwy',
      address2: null,
      provinceCode: 'CA',
      postalCode: '94043',
      data: {},
    });
  });
});
