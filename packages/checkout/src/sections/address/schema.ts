import * as yup from 'yup';
import type { AddressFormData } from './types';

/**
 * Yup validation schema for AddressFormData: the group needs a saved address with a city.
 */
export const addressFormSchema = yup.object<AddressFormData>().shape({
  address: yup
    .object({
      city: yup.string().nullable().required('City is required'),
    })
    .nullable()
    .required('City is required'),
});
