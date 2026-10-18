import * as yup from 'yup';
import type { PromoFormData } from './types';

/** Promo codes are optional; the section is valid with any list of applied codes. */
export const promoFormSchema = yup.object<PromoFormData>().shape({
  codes: yup
    .array()
    .of(yup.object({ code: yup.string().required(), provider: yup.string().default('') }))
    .default([]),
});
