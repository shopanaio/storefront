import * as yup from 'yup';

/**
 * Validation schema for address delivery form
 */
export const addressSchema = yup.object({
  userStreet: yup.mixed().required('required'),
  userBuilding: yup.string().trim().required('required'),
  userApartment: yup.string().optional(),
});

/**
 * Validation schema for warehouse delivery form
 */
export const warehouseSchema = yup.object({
  warehouse: yup.mixed().required('required'),
});
