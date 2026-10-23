import '#checkout/vendors/liqpay/register';
import '#checkout/vendors/nova-poshta/register';
import type { PaymentFormData, PaymentMethod } from './types';
import { paymentFormSchema } from './schema';

const liqpay: PaymentMethod = {
  handle: 'h-liqpay',
  code: 'liqpay',
  title: 'LiqPay',
  flow: 'ONLINE',
  provider: 'liqpay',
  data: undefined,
};

const cod: PaymentMethod = {
  handle: 'h-cod',
  code: 'nova-poshta-cod',
  title: 'COD',
  flow: 'ON_DELIVERY',
  provider: 'nova-poshta',
  data: undefined,
};

const unknownProvider: PaymentMethod = {
  handle: 'h-card',
  code: 'card',
  title: 'Card',
  flow: 'ONLINE',
  provider: 'test-stripe',
  data: undefined,
};

const unknownMethod: PaymentMethod = {
  ...liqpay,
  handle: 'h-liqpay-qr',
  code: 'liqpay-qr',
};

const form = (
  selectedPaymentMethod: PaymentMethod | null,
  paymentMethods: PaymentMethod[] = [
    liqpay,
    cod,
    unknownProvider,
    unknownMethod,
  ]
): PaymentFormData => ({
  paymentRequired: true,
  paymentMethods,
  selectedPaymentMethod,
  resetReason: null,
});

describe('paymentFormSchema', () => {
  it.each([liqpay, cod])(
    'accepts a selected method with a module: $code',
    async (method) => {
      await expect(
        paymentFormSchema.validate(form(method))
      ).resolves.toBeTruthy();
    },
    // The first case loads the vendor module, which takes seconds under a parallel run.
    15_000
  );

  it('accepts no methods or selection when the server has nothing to collect', async () => {
    await expect(
      paymentFormSchema.validate({ ...form(null, []), paymentRequired: false })
    ).resolves.toBeTruthy();
  });

  it('requires a selected method', async () => {
    await expect(paymentFormSchema.validate(form(null))).rejects.toThrow(
      'A payment method must be selected'
    );
  });

  it('rejects an empty method list', async () => {
    await expect(
      paymentFormSchema.validate(form(null, []), { abortEarly: false })
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        'At least one payment method is required',
      ]),
    });
  });

  it.each([unknownProvider, unknownMethod])(
    'rejects a selected method without a UI module: $code',
    async (method) => {
      await expect(paymentFormSchema.validate(form(method))).rejects.toThrow(
        'The selected payment method is unavailable'
      );
    }
  );
});
