import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ProviderProps } from '#checkout/vendors/types';
import type { PaymentFormData, PaymentMethod } from '../types';
import { PaymentSectionView } from './Component';

const mocks = vi.hoisted(() => ({ selectPaymentMethod: vi.fn() }));

vi.mock('#checkout/context/CheckoutApiContext', () => ({
  useCheckoutApi: () => ({ selectPaymentMethod: mocks.selectPaymentMethod }),
}));
vi.mock('#checkout/infra/ProviderRenderer', () => ({
  ProviderRenderer: ({
    availableMethods,
    selectedMethod,
    onSelectMethod,
  }: ProviderProps) => (
    <>
      {availableMethods.map((method) => (
        <label key={method.handle}>
          <input
            type="radio"
            checked={selectedMethod?.handle === method.handle}
            onChange={() => onSelectMethod?.(method)}
          />
          {method.title}
        </label>
      ))}
    </>
  ),
}));

const method = (handle: string, title: string): PaymentMethod => ({
  handle,
  code: handle,
  title,
  flow: 'ON_DELIVERY',
  provider: 'test',
  data: undefined,
});
const card = method('card', 'Card');
const cod = method('cod', 'Cash on delivery');

// The mapper builds new objects on every checkout read.
const data = (selected: PaymentMethod | null): PaymentFormData => ({
  paymentRequired: true,
  paymentMethods: [{ ...card }, { ...cod }],
  selectedPaymentMethod: selected ? { ...selected } : null,
  resetReason: null,
});

const view = (value: PaymentFormData) => (
  <NextIntlClientProvider
    locale="en"
    messages={{ Checkout: {} }}
    onError={() => {}}
  >
    <PaymentSectionView data={value} />
  </NextIntlClientProvider>
);

describe('PaymentSectionView', () => {
  it('SC-9pzs: an answer to another section keeps the method being saved', async () => {
    let confirm!: () => void;
    mocks.selectPaymentMethod.mockReturnValue(
      new Promise<void>((resolve) => {
        confirm = resolve;
      })
    );
    const { rerender } = render(view(data(card)));
    fireEvent.click(screen.getByLabelText('Cash on delivery'));
    expect(screen.getByLabelText('Cash on delivery')).toBeChecked();

    // The contact save answers with the checkout as it was before the payment save.
    rerender(view(data(card)));
    expect(screen.getByLabelText('Cash on delivery')).toBeChecked();

    rerender(view(data(cod)));
    await act(async () => confirm());
    expect(screen.getByLabelText('Cash on delivery')).toBeChecked();
  });

  it('SC-qxiu: a failed save shows the method the server confirmed last', async () => {
    let fail!: (error: unknown) => void;
    mocks.selectPaymentMethod.mockReturnValue(
      new Promise<void>((_, reject) => {
        fail = reject;
      })
    );
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(view(data(null)));
    fireEvent.click(screen.getByLabelText('Card'));

    // Meanwhile another tab saved cash on delivery.
    rerender(view(data(cod)));
    await act(async () => fail(new Error('Failed to fetch')));

    expect(screen.getByLabelText('Cash on delivery')).toBeChecked();
    expect(screen.getByLabelText('Card')).not.toBeChecked();
    errorLog.mockRestore();
  });
});
