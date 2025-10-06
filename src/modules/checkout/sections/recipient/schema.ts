import * as yup from 'yup';
import type { RecipientFormData } from './types';

/**
 * Yup validation schema for RecipientFormData
 * If self=false, recipient contact information is required
 */
export const recipientFormSchema = yup.object<RecipientFormData>().shape({
  self: yup.boolean().required(),
  userFirstName: yup.string().when('self', {
    is: false,
    then: (schema) => schema.required('Recipient first name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  userLastName: yup.string().when('self', {
    is: false,
    then: (schema) => schema.required('Recipient last name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  userMiddleName: yup.string().optional(),
  userPhone: yup.string().when('self', {
    is: false,
    then: (schema) =>
      schema
        .required('Recipient phone is required')
        .matches(/^\+?[0-9\s()-]+$/, 'Invalid phone number format'),
    otherwise: (schema) => schema.optional(),
  }),
});
