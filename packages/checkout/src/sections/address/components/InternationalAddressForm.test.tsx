import { act, fireEvent, render, screen } from '@testing-library/react';
import { CheckoutEvent, emitCheckoutEvent } from '#checkout/state/checkoutBus';
import { NextIntlClientProvider } from 'next-intl';
import type { DeliveryCountry } from '../countries';
import { InternationalAddressForm } from './InternationalAddressForm';

const gb: DeliveryCountry = {
  code: 'GB',
  name: 'United Kingdom',
  addressFormat: {
    rows: [['FIRST_NAME', 'LAST_NAME'], ['ADDRESS1'], ['ADDRESS2'], ['CITY'], ['POSTAL_CODE'], ['PHONE']],
    required: ['FIRST_NAME', 'LAST_NAME', 'ADDRESS1', 'CITY', 'POSTAL_CODE'],
    provinceLabel: null,
    postalCodeLabel: 'POSTCODE',
    postalCodePattern: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$',
    postalCodeExample: 'SW1A 1AA',
    provinces: [],
  },
};

const messages = {
  Checkout: {
    'address-line1': 'Address',
    'address-line2': 'Apartment',
    'address-optional': '{label} (optional)',
    'address-postcode': 'Postcode',
    city: 'City',
    'required-field': 'Required',
    'address-postal-code-invalid-example': 'Invalid, e.g. {example}',
  },
};

function renderForm(onSubmit = vi.fn()) {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <InternationalAddressForm address={null} country={gb} onSubmit={onSubmit} />
    </NextIntlClientProvider>
  );
  return onSubmit;
}

const type = (label: string, value: string) => {
  const input = screen.getByLabelText(label);
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
};

describe('InternationalAddressForm', () => {
  it('lays out the address fields of the country without name and phone', () => {
    renderForm();
    expect(screen.getByLabelText('Address')).toBeTruthy();
    expect(screen.getByLabelText('Apartment (optional)')).toBeTruthy();
    expect(screen.getByLabelText('City')).toBeTruthy();
    expect(screen.getByLabelText('Postcode')).toBeTruthy();
    expect(screen.queryByLabelText(/name|phone/i)).toBeNull();
  });

  it('saves the address once the form is complete and valid', () => {
    const onSubmit = renderForm();
    type('Address', '10 Downing St');
    type('City', 'London');
    type('Postcode', 'nope');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Invalid, e.g. SW1A 1AA')).toBeTruthy();

    type('Postcode', 'SW1A 2AA');
    expect(onSubmit).toHaveBeenCalledWith({
      countryCode: 'GB',
      city: 'London',
      address1: '10 Downing St',
      address2: null,
      provinceCode: null,
      postalCode: 'SW1A 2AA',
      data: {},
    });
  });

  it('marks every missing required field when the order is submitted', async () => {
    renderForm();
    expect(screen.queryByText('Required')).toBeNull();
    await act(async () => {
      await emitCheckoutEvent(CheckoutEvent.SubmitRequested, {});
    });
    // Address, city and postcode; the apartment is optional.
    expect(screen.getAllByText('Required')).toHaveLength(3);
  });
});
