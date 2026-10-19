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
    addDeliveryAddresses: vi.fn(),
    updateDeliveryAddresses: vi.fn(),
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
  rows: [['ADDRESS1'], ['ADDRESS2'], ['CITY'], ['POSTAL_CODE']] as DeliveryCountry['addressFormat']['rows'],
  required,
  provinceLabel: null,
  postalCodeLabel: 'POSTCODE',
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
    mocks.countries = { countries: [gb, de], loading: false, error: null, refetch: vi.fn() };
    mocks.api.addDeliveryAddresses.mockReset().mockResolvedValue(undefined);
    mocks.api.updateDeliveryAddresses.mockReset().mockResolvedValue(undefined);
  });

  // Ожидаемое поведение: повторная загрузка списка стран (например, после смены языка) не
  // стирает то, что покупатель уже ввёл в несохранённые поля адреса.
  it('[A6] keeps the unsaved address fields while the list of countries loads again', async () => {
    const { rerender } = render(view(data()));
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '10 Downing St' } });

    // The country list is read again (new locale): no data until it arrives.
    mocks.countries = { ...mocks.countries, countries: [], loading: true };
    rerender(view(data({ localeCode: 'uk' })));
    mocks.countries = { ...mocks.countries, countries: [gb, de], loading: false };
    rerender(view(data({ localeCode: 'uk' })));
    await act(async () => undefined);

    expect(screen.getByLabelText('Address')).toHaveValue('10 Downing St');
  });

  // Ожидаемое поведение: страна, в которой покупатель уже начал вводить адрес, не меняется
  // неявно (из customerIdentity.countryCode), и введённое не пропадает.
  it('[A6] keeps the form the buyer is typing in when the buyer country changes implicitly', async () => {
    const { rerender } = render(view(data({ customerCountryCode: 'GB' })));
    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '10 Downing St' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'London' } });

    // A contact save elsewhere changes the buyer country; no address is saved yet.
    rerender(view(data({ customerCountryCode: 'DE' })));
    await act(async () => undefined);

    expect(screen.getByLabelText('Address')).toHaveValue('10 Downing St');
    expect(screen.getByLabelText('City')).toHaveValue('London');
  });

  // Ожидаемое поведение (G1): если сохранение адреса отклонено конфликтом версий
  // (CHECKOUT_VERSION_CONFLICT от параллельной мутации другой секции), адрес не теряется:
  // он отправляется ещё раз и доходит до сервера.
  it('[G1] saves the address again when the save loses a version conflict to another section', async () => {
    const conflict = Object.assign(new Error('Checkout was changed'), {
      code: 'CHECKOUT_VERSION_CONFLICT',
    });
    mocks.api.addDeliveryAddresses
      .mockRejectedValueOnce([conflict])
      .mockResolvedValue(undefined);
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(view(data()));

    fireEvent.change(screen.getByLabelText('Address'), { target: { value: '10 Downing St' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'London' } });
    fireEvent.change(screen.getByLabelText('Postcode'), { target: { value: 'SW1A 2AA' } });
    fireEvent.blur(screen.getByLabelText('Postcode'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(mocks.api.addDeliveryAddresses).toHaveBeenCalledTimes(2);
    expect(mocks.api.addDeliveryAddresses).toHaveBeenLastCalledWith({
      addresses: [
        {
          address: expect.objectContaining({ address1: '10 Downing St', city: 'London' }),
          checkoutLineIds: ['line-1'],
        },
      ],
    });
    errorLog.mockRestore();
  });
});
