import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { PromoFormData } from '../types';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

/**
 * Promo section component created with makeSection.
 * Handles promo code for checkout.
 */
export const PromoSection = makeSection<
  'promo',
  PromoFormData,
  PromoFormData
>({
  id: 'promo',
  required: false,
  Component,
  selector: (state: CheckoutState) =>
    (state.sections.promo?.data ?? null) as PromoFormData | null,
  displayName: 'PromoSection',
});
