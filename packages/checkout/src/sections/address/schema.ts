import * as yup from 'yup';
import type { AddressFormData } from './types';

/**
 * Yup validation schema for AddressFormData
 */
export const addressFormSchema = yup.object<AddressFormData>().shape({
  city: yup
    .object()
    .nullable()
    .required('City is required')
    .test('is-city-selected', 'City is required', (value) => value !== null),
});
