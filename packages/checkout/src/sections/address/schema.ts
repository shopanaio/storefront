import * as yup from 'yup';
import type { AddressFormData } from './types';

/**
 * Yup validation schema for AddressFormData: the group needs a saved address with a country
 * and a city. The fields each country requires are checked by its form before saving; an
 * address of another country than the one picked in the selector is invalidated by the view.
 */
export const addressFormSchema = yup.object<AddressFormData>().shape({
  address: yup
    .object({
      countryCode: yup.string().nullable().required('Country is required'),
      city: yup.string().nullable().required('City is required'),
    })
    .nullable()
    .required('City is required'),
});
