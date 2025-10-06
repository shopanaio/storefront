import type { Checkout } from '@src/modules/checkout/types/entity';
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
      code: method.code,
      provider: method.provider,
      data: method.metadata,
    })
  );

  const selectedPaymentMethod: PaymentMethod =
    payment.selectedPaymentMethod
      ? {
          code: payment.selectedPaymentMethod.code,
          provider: payment.selectedPaymentMethod.provider,
          data: payment.selectedPaymentMethod.metadata,
        }
      : paymentMethods[0];

  return {
    paymentMethods,
    selectedPaymentMethod,
  };
}
