import type { Checkout } from '#checkout/types/entity';
import type { PaymentFormData, PaymentMethod } from './types';

function mapPaymentMethod(method: Checkout.PaymentMethod): PaymentMethod {
  return {
    handle: method.handle,
    code: method.code,
    title: method.title,
    flow: method.flow,
    provider: method.provider.code,
    data: undefined,
  };
}

/**
 * Maps Checkout.Checkout entity to PaymentFormData.
 * Keeps the API order of methods and the reset reason of the selection.
 */
export function mapCheckoutToPaymentFormData(
  checkout: Checkout.Checkout | null
): PaymentFormData | null {
  if (!checkout) {
    return null;
  }

  const { selection, paymentMethods } = checkout.payment;

  return {
    paymentRequired: checkout.payment.payableAmount.amount > 0,
    paymentMethods: paymentMethods.map(mapPaymentMethod),
    selectedPaymentMethod: selection.method
      ? mapPaymentMethod(selection.method)
      : null,
    resetReason: selection.status === 'RESET' ? selection.resetReason : null,
  };
}
