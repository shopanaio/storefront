import type { Checkout } from '#checkout/types/entity';
import type { PaymentFormData, PaymentMethod } from './types';

/**
 * Maps Checkout.Checkout entity to PaymentFormData
 * Extracts payment methods and selected payment method
 */
export function mapCheckoutToPaymentFormData(
  checkout: Checkout.Checkout | null
): PaymentFormData | null {
  if (!checkout) {
    return null;
  }

  const { payment } = checkout;

  if (!payment || payment.paymentMethods.length === 0) {
    return null;
  }

  const paymentMethods: PaymentMethod[] = payment.paymentMethods.map(
    (method) => ({
      handle: method.handle,
      code: method.code,
      provider: method.provider.code,
      data: undefined,
    })
  );

  const selectedMethod = payment.selection.method;
  const selectedPaymentMethod: PaymentMethod | null = selectedMethod
    ? {
        handle: selectedMethod.handle,
        code: selectedMethod.code,
        provider: selectedMethod.provider.code,
        data: undefined,
      }
    : null;

  return {
    paymentMethods,
    selectedPaymentMethod,
  };
}
