import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { PromoFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';
import { mapCheckoutToPromoFormData } from '../mapper';
import { promoFormSchema } from '../schema';

/**
 * Promo section component created with makeSection.
 * Handles promo code for checkout.
 */
export const PromoSection = makeSection<PromoFormData>({
  id: SectionId.Promo,
  required: false,
  Component,
  selector: mapCheckoutToPromoFormData,
  schema: promoFormSchema,
  displayName: 'PromoSection',
});
