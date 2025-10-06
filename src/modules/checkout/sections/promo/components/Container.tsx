import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { PromoFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';

/**
 * Promo section component created with makeSection.
 * Handles promo code for checkout.
 */
export const PromoSection = makeSection<PromoFormData>({
  id: SectionId.Promo,
  required: false,
  Component,
  selector: (state) =>
    (state.sections.promo?.data ?? null) as PromoFormData | null,
  displayName: 'PromoSection',
});
