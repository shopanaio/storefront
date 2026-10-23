import * as yup from 'yup';
import type { PromoFormData } from './types';

/**
 * Promo codes are optional; the section is valid with any list of codes, whatever their state:
 * a code that is not applied does not block the order.
 */
export const promoFormSchema = yup.object<PromoFormData>().shape({
  codes: yup
    .array()
    .of(
      yup.object({
        code: yup.string().required(),
        status: yup.string().required(),
        message: yup.string().nullable().default(null),
      })
    )
    .default([]),
});
