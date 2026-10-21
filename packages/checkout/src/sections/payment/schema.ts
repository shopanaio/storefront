import * as yup from 'yup';
import type { PaymentFormData, PaymentMethod } from './types';
import { ProviderModuleType } from '#checkout/vendors/types';
import { buildSelectedProviderMethodSchema } from '#checkout/utils/validation';

/**
 * Yup validation schema for PaymentMethod
 */
const paymentMethodSchema = yup.object<PaymentMethod>().shape({
  handle: yup.string().required('Payment method handle is required'),
  code: yup.string().required('Payment method code is required'),
  title: yup.string().defined(),
  flow: yup.string().required('Payment flow is required'),
  provider: yup.string().required('Payment provider is required'),
  data: yup.mixed(),
});

/**
 * Yup validation schema for PaymentFormData.
 * A selected method is required only when the server has an amount to collect.
 * Its data is validated only when the method
 * module declares a schema. A selected method without a UI module is invalid.
 */
export const paymentFormSchema = yup.object<PaymentFormData>().shape({
  paymentRequired: yup.boolean().required(),
  paymentMethods: yup
    .array()
    .of(paymentMethodSchema)
    .when('paymentRequired', {
      is: true,
      then: (schema) =>
        schema.min(1, 'At least one payment method is required'),
    })
    .required('Payment methods are required'),
  selectedPaymentMethod: yup
    .mixed<PaymentMethod>()
    .nullable()
    .when('paymentRequired', {
      is: false,
      then: (schema) => schema.oneOf([null]).defined(),
      otherwise: () =>
        buildSelectedProviderMethodSchema({
          moduleType: ProviderModuleType.Payment,
          baseSchema: paymentMethodSchema,
          requireMethodModule: true,
          messages: {
            required: 'A payment method must be selected',
            notSelected: 'A payment method must be selected',
            invalid: 'Invalid payment method data',
            unavailable: 'The selected payment method is unavailable',
          },
        }),
    }),
});
