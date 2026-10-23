import * as yup from 'yup';

/**
 * Loyalty is optional and never blocks the section list: a selection that cannot be used is
 * reported by its checkout issue and the banner.
 */
export const loyaltyFormSchema = yup.object();
