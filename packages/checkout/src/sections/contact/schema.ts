import * as yup from 'yup';
import type { ContactFormData } from './types';

/**
 * Yup validation schema for ContactFormData
 */
export const contactFormSchema = yup.object<ContactFormData>().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  middleName: yup.string().default(''),
  phone: yup
    .string()
    .required('Phone is required')
    .matches(/^\+?[0-9\s()-]+$/, 'Invalid phone number format'),
});
