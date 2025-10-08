import * as yup from 'yup';
import type { PaymentFormData, PaymentMethod } from './types';
import { ProviderModuleType } from '@src/modules/checkout/vendors/types';
import { buildSelectedProviderMethodSchema } from '@src/modules/checkout/utils/validation';
/**
 * Yup validation schema for PaymentMethod
 */
const paymentMethodSchema = yup.object<PaymentMethod>().shape({
  code: yup.string().required('Payment method code is required'),
  provider: yup.string().required('Payment provider is required'),
  data: yup.mixed(),
});

/**
 * Yup validation schema for PaymentFormData
 * Validates that at least one payment method exists and one is selected
 */
export const paymentFormSchema = yup.object<PaymentFormData>().shape({
  paymentMethods: yup
    .array()
    .of(paymentMethodSchema)
    .min(1, 'At least one payment method is required')
    .required('Payment methods are required'),
  selectedPaymentMethod: buildSelectedProviderMethodSchema({
    moduleType: ProviderModuleType.Payment,
    baseSchema: paymentMethodSchema,
    messages: {
      required: 'A payment method must be selected',
      notSelected: 'A payment method must be selected',
      invalid: 'Invalid payment method data',
    },
  }),
});
