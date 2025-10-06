import * as yup from 'yup';
import type { DeliveryFormData, DeliveryGroup, DeliveryMethod } from './types';

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
