import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { PaymentFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';

/**
 * Payment section component created with makeSection.
 * Handles payment method selection for checkout.
 */
export const PaymentSection = makeSection<PaymentFormData>({
  id: SectionId.Payment,
  required: true,
  Component,
  selector: (state) =>
    (state.sections.payment?.data ?? null) as PaymentFormData | null,
  displayName: 'PaymentSection',
});
