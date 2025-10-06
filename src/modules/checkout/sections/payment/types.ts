export interface PaymentMethod {
  code: string;
  provider: string;
  data: unknown;
}

/**
 * Form data type for the payment section
 */
export interface PaymentFormData {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod;
}
