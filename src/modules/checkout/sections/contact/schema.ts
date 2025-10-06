import * as yup from 'yup';
import type { ContactFormData } from './types';

/**
 * Yup validation schema for ContactFormData
 */
export const contactFormSchema = yup.object<ContactFormData>().shape({
  userFirstName: yup.string().required('First name is required'),
  userLastName: yup.string().required('Last name is required'),
  userMiddleName: yup.string().default(''),
  userPhone: yup
    .string()
    .required('Phone is required')
    .matches(/^\+?[0-9\s()-]+$/, 'Invalid phone number format'),
});
