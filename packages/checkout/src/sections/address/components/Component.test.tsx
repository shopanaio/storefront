import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { DeliveryCountry } from '../countries';
import type { AddressFormData } from '../types';
import { AddressSectionView } from './Component';

const mocks = vi.hoisted(() => ({
  countries: {
    countries: [] as DeliveryCountry[],
    loading: false,
    error: null as Error | null,
    refetch: vi.fn(),
  },
  api: {
    saveDeliveryAddress: vi.fn(),
  },
}));

vi.mock('#checkout/hooks/useDeliveryCountries', () => ({
  useDeliveryCountries: () => mocks.countries,
}));
vi.mock('#checkout/context/CheckoutApiContext', () => ({
  useCheckoutApi: () => mocks.api,
}));
vi.mock('#checkout/infra/useRegisteredModule', () => ({
  useRegisteredModule: () => ({ found: false, api: null }),
}));

const format = (required: DeliveryCountry['addressFormat']['required']) => ({
  rows: [
    ['ADDRESS1'],
    ['ADDRESS2'],
    ['CITY'],
    ['POSTAL_CODE'],
  ] as DeliveryCountry['addressFormat']['rows'],
  required,
  provinceLabel: null,
  postalCodeLabel: 'POSTCODE' as const,
  postalCodePattern: null,
  postalCodeExample: null,
  provinces: [],
});
const gb: DeliveryCountry = {
  code: 'GB',
  name: 'United Kingdom',
  addressFormat: format(['ADDRESS1', 'CITY', 'POSTAL_CODE']),
};
const de: DeliveryCountry = {
  code: 'DE',
  name: 'Germany',
  addressFormat: format(['ADDRESS1', 'CITY', 'POSTAL_CODE']),
};

const messages = {
  Checkout: {
    'address-line1': 'Address',
    'address-line2': 'Apartment',
    'address-optional': '{label} (optional)',
    'address-postcode': 'Postcode',
    city: 'City',
    'required-field': 'Required',
    'country-region': 'Country',
    'error-save-address': "Couldn't save the delivery address",
  },
};

const data = (patch: Partial<AddressFormData> = {}): AddressFormData => ({
  addressIds: [],
  unaddressedLineIds: ['line-1'],
  localeCode: 'en',
  customerCountryCode: 'GB',
  address: null,
  ...patch,
});

const view = (value: AddressFormData) => (
  <NextIntlClientProvider locale="en" messages={messages} onError={() => {}}>
    <AddressSectionView data={value} invalidate={() => {}} />
  </NextIntlClientProvider>
);

describe('AddressSectionView', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  beforeEach(() => {
    mocks.countries = {
      countries: [gb, de],
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    mocks.api.saveDeliveryAddress.mockReset().mockResolvedValue(undefined);
  });

  // Expected behavior: reloading the country list (e.g. after a language change) does not
  // erase what the buyer has already typed into unsaved address fields.
  it('SC-s8ak: keeps the unsaved address fields while the list of countries loads again', async () => {
    const { rerender } = render(view(data()));
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '10 Downing St' },
    });

    // The country list is read again (new locale): no data until it arrives.
    mocks.countries = { ...mocks.countries, countries: [], loading: true };
    rerender(view(data({ localeCode: 'uk' })));
    mocks.countries = {
      ...mocks.countries,
      countries: [gb, de],
      loading: false,
    };
    rerender(view(data({ localeCode: 'uk' })));
    await act(async () => undefined);

    expect(screen.getByLabelText('Address')).toHaveValue('10 Downing St');
  });

  // Expected behavior: the country in which the buyer has started entering an address does not
  // change implicitly (from customerIdentity.countryCode), and the entered data is kept.
  it('SC-s8ak: keeps the form the buyer is typing in when the buyer country changes implicitly', async () => {
    const { rerender } = render(view(data({ customerCountryCode: 'GB' })));
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '10 Downing St' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'London' },
    });

    // A contact save elsewhere changes the buyer country; no address is saved yet.
    rerender(view(data({ customerCountryCode: 'DE' })));
    await act(async () => undefined);

    expect(screen.getByLabelText('Address')).toHaveValue('10 Downing St');
    expect(screen.getByLabelText('City')).toHaveValue('London');
  });

  it('SC-nker: shows a failed address save and keeps the address in the form', async () => {
    mocks.api.saveDeliveryAddress.mockRejectedValueOnce(
      new Error('Failed to fetch')
    );
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(view(data()));

    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: '10 Downing St' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'London' },
    });
    fireEvent.change(screen.getByLabelText('Postcode'), {
      target: { value: 'SW1A 2AA' },
    });
    fireEvent.blur(screen.getByLabelText('Postcode'));
    await act(async () => undefined);

    expect(mocks.api.saveDeliveryAddress).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: 'GB',
        address1: '10 Downing St',
        city: 'London',
      })
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't save the delivery address"
    );
    expect(screen.getByLabelText('Address')).toHaveValue('10 Downing St');
    expect(screen.getByLabelText('Postcode')).toHaveValue('SW1A 2AA');

    // Saving again succeeds and the message goes away.
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Westminster' },
    });
    fireEvent.blur(screen.getByLabelText('City'));
    await act(async () => undefined);
    expect(screen.queryByRole('alert')).toBeNull();
    errorLog.mockRestore();
  });

  it('SC-s8ak: an explicit change of the country carries the matching fields over', async () => {
    render(view(data()));
    fireEvent.change(screen.getByLabelText('Address'), {
      target: { value: 'Unter den Linden 1' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Berlin' },
    });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Country' }));
    fireEvent.click(await screen.findByTitle('Germany'));
    await act(async () => undefined);

    expect(screen.getByLabelText('Address')).toHaveValue('Unter den Linden 1');
    expect(screen.getByLabelText('City')).toHaveValue('Berlin');
  });

  // Expected behavior: a saved Ukrainian address (city) is shown immediately, without waiting for
  // the country list: the Ukraine form needs no address format, the city comes with the checkout.
  it('shows a saved Ukrainian address while the countries load', () => {
    mocks.countries = { ...mocks.countries, countries: [], loading: true };
    const saved = (countryCode: string) =>
      data({
        address: {
          addressId: 'address-1',
          countryCode,
          city: 'Київ',
          address1: null,
          address2: null,
          postalCode: null,
          provinceCode: null,
          data: null,
        },
      });

    const { container, rerender } = render(view(saved('UA')));
    expect(container.querySelector('.ant-skeleton')).toBeNull();

    // Another country is laid out by its address format: it waits for the list.
    rerender(view(saved('GB')));
    expect(container.querySelector('.ant-skeleton')).not.toBeNull();
  });
});
