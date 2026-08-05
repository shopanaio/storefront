import * as yup from 'yup';

/**
 * Validation schema for address delivery form
 * The object itself must be defined when method is selected
 */
export const addressSchema = yup.object({
  userStreet: yup.mixed().required('required'),
  userBuilding: yup.string().trim().required('required'),
  userApartment: yup.string().required('required'),
}).required('Address data is required');

/**
 * Validation schema for warehouse delivery form
 * The object itself must be defined when method is selected
 */
export const warehouseSchema = yup.object({
  warehouse: yup.mixed().required('required'),
}).required('Warehouse data is required');
