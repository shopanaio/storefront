import * as yup from 'yup';
import type { PromoFormData } from './types';

/**
 * Yup validation schema for PromoFormData
 * Promo is optional, but if code is provided, it must not be empty
 */
export const promoFormSchema = yup.object<PromoFormData>().shape({
  code: yup.string().trim().min(1, 'Promo code cannot be empty').default(''),
  provider: yup.string().default(''),
});
