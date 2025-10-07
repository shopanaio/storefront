import * as yup from 'yup';
import type { DeliveryFormData, DeliveryGroup, DeliveryMethod } from './types';
import { resolveProviderConfig } from '@src/modules/checkout/infra/resolveProviderConfig';
import { ProviderModuleType } from '@src/modules/checkout/vendors/types';

/**
 * Yup validation schema for DeliveryMethod
 */
const deliveryMethodSchema = yup.object<DeliveryMethod>().shape({
  code: yup.string().required('Delivery method code is required'),
  provider: yup.string().required('Delivery provider is required'),
  data: yup.mixed(),
});

/**
 * Yup validation schema for DeliveryGroup
 */
const deliveryGroupSchema = yup.object<DeliveryGroup>().shape({
  id: yup.string().required('Delivery group ID is required'),
  deliveryMethods: yup
    .array()
    .of(deliveryMethodSchema)
    .min(1, 'At least one delivery method is required')
    .required('Delivery methods are required'),
  selectedDeliveryMethod: deliveryMethodSchema
    .required('A delivery method must be selected')
    .test(
      'is-selected',
      'A delivery method must be selected',
      (value) => value !== null && value !== undefined
    )
    .test(
      'by-provider-method',
      'Invalid delivery method data',
      function (value) {
        if (!value) return true;
        const { code, provider, data } = value as DeliveryMethod;
        const config = resolveProviderConfig(
          ProviderModuleType.Delivery,
          provider
        );

        const methodConfig = config?.methods.find((m) => m.code === code);

        // If there's no schema for this method, consider it valid
        if (!methodConfig?.schema) {
          return true;
        }

        // Method has a schema, so we must validate data
        try {
          methodConfig.schema.validateSync(data, { abortEarly: false });
          return true;
        } catch (e) {
          return this.createError({ message: (e as Error).message });
        }
      }
    ),
});

/**
 * Yup validation schema for DeliveryFormData
 * Validates that at least one delivery group exists and has a selected method
 */
export const deliveryFormSchema = yup.lazy((obj: DeliveryFormData) => {
  const shape: Record<string, yup.AnySchema> = {};

  for (const key in obj) {
    shape[key] = deliveryGroupSchema;
  }

  return yup
    .object()
    .shape(shape)
    .test(
      'has-groups',
      'At least one delivery group is required',
      (value) => value && Object.keys(value).length > 0
    );
});
