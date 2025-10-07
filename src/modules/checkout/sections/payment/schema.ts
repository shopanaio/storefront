import * as yup from 'yup';
import type { PaymentFormData, PaymentMethod } from './types';
import { ProviderModuleType } from '@src/modules/checkout/vendors/types';
import { resolveProviderConfig } from '@src/modules/checkout/infra/resolveProviderConfig';
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
  selectedPaymentMethod: paymentMethodSchema
    .required('A payment method must be selected')
    .test(
      'is-selected',
      'A payment method must be selected',
      (value) => value !== null && value !== undefined
    )
    .test(
      'by-provider-method',
      'Invalid payment method data',
      function (value) {
        if (!value) return true;
        const { code, provider, data } = value as PaymentMethod;
        const config = resolveProviderConfig(
          ProviderModuleType.Payment,
          provider
        );

        const methodConfig = config?.methods.find((m) => m.code === code);
        if (!methodConfig?.schema) {
          return true;
        }

        try {
          methodConfig.schema?.validateSync(data, { abortEarly: false });
          return true;
        } catch (e) {
          return this.createError({ message: (e as Error).message });
        }
      }
    ),
});
