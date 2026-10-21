import type { Checkout } from '#checkout/types/entity';

export interface PaymentMethod {
  handle: string;
  code: string;
  title: string;
  flow: Checkout.PaymentFlow;
  provider: string;
  data: unknown;
}

/**
 * Form data type for the payment section
 */
export interface PaymentFormData {
  /** Whether the server still has an amount to collect. */
  paymentRequired: boolean;
  /** Payment methods in API order. */
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  /** Why the API reset the previous selection; text is shown as is. */
  resetReason: Checkout.SelectionResetReason | null;
}
