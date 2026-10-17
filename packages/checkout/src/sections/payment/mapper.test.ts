import type { Checkout } from '#checkout/types/entity';
import { mapCheckoutToPaymentFormData } from './mapper';

const method = (
  handle: string,
  code: string,
  provider: string,
  flow: Checkout.PaymentFlow
): Checkout.PaymentMethod => ({
  handle,
  code,
  title: `Title ${code}`,
  flow,
  provider: { code: provider },
});

const checkoutWithPayment = (payment: Checkout.Payment) =>
  ({ payment }) as unknown as Checkout.Checkout;

const liqpay = method('h-liqpay', 'liqpay', 'liqpay', 'ONLINE');
const cod = method('h-cod', 'nova-poshta-cod', 'nova-poshta', 'ON_DELIVERY');
const stripe = method('h-stripe', 'card', 'test-stripe', 'ONLINE');

const payment = (
  selection: Partial<Checkout.PaymentMethodSelection> = {}
): Checkout.Payment => ({
  payableAmount: { amount: 100, currencyCode: 'UAH' },
  paymentMethods: [cod, stripe, liqpay],
  selection: {
    status: 'NONE',
    method: null,
    previousMethodHandle: null,
    resetReason: null,
    ...selection,
  },
});

describe('mapCheckoutToPaymentFormData', () => {
  it('returns null without a checkout', () => {
    expect(mapCheckoutToPaymentFormData(null)).toBeNull();
  });

  it('keeps the API order of methods, providers interleaved', () => {
    const data = mapCheckoutToPaymentFormData(checkoutWithPayment(payment()));

    expect(data?.paymentMethods.map((m) => m.handle)).toEqual([
      'h-cod',
      'h-stripe',
      'h-liqpay',
    ]);
    expect(data?.paymentMethods[0]).toEqual({
      handle: 'h-cod',
      code: 'nova-poshta-cod',
      title: 'Title nova-poshta-cod',
      flow: 'ON_DELIVERY',
      provider: 'nova-poshta',
      data: undefined,
    });
  });

  it('maps the selected method', () => {
    const data = mapCheckoutToPaymentFormData(
      checkoutWithPayment(payment({ status: 'SELECTED', method: liqpay }))
    );

    expect(data?.selectedPaymentMethod?.handle).toBe('h-liqpay');
    expect(data?.resetReason).toBeNull();
  });

  it('exposes the reset reason only for a RESET selection', () => {
    const reason = { code: 'METHOD_UNAVAILABLE', message: 'Method is gone' };

    const reset = mapCheckoutToPaymentFormData(
      checkoutWithPayment(
        payment({
          status: 'RESET',
          previousMethodHandle: 'h-cod',
          resetReason: reason,
        })
      )
    );
    expect(reset?.selectedPaymentMethod).toBeNull();
    expect(reset?.resetReason).toEqual(reason);

    const selected = mapCheckoutToPaymentFormData(
      checkoutWithPayment(
        payment({ status: 'SELECTED', method: liqpay, resetReason: reason })
      )
    );
    expect(selected?.resetReason).toBeNull();
  });

  it('keeps an empty method list so validation can reject it', () => {
    const data = mapCheckoutToPaymentFormData(
      checkoutWithPayment({ ...payment(), paymentMethods: [] })
    );

    expect(data).toEqual({
      paymentMethods: [],
      selectedPaymentMethod: null,
      resetReason: null,
    });
  });
});
