import * as yup from 'yup';
import type { RecipientFormData } from './types';

/**
 * Yup validation schema for RecipientFormData
 *
 * When self=false, recipient contact information is required.
 * Empty strings are treated as invalid (min length 1).
 */
export const recipientFormSchema = yup.object<RecipientFormData>().shape({
  self: yup.boolean().required(),
  deliveryGroupId: yup.string().required(),
  firstName: yup.string().when('self', {
    is: false,
    then: (schema) =>
      schema
        .required('Recipient first name is required')
        .min(1, 'Recipient first name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  lastName: yup.string().when('self', {
    is: false,
    then: (schema) =>
      schema
        .required('Recipient last name is required')
        .min(1, 'Recipient last name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  middleName: yup.string().optional(),
  phone: yup.string().when('self', {
    is: false,
    then: (schema) =>
      schema
        .required('Recipient phone is required')
        .min(1, 'Recipient phone is required')
        .matches(/^\+?[0-9\s()-]+$/, 'Invalid phone number format'),
    otherwise: (schema) => schema.optional(),
  }),
});
