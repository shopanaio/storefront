import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { PaymentFormData } from '../types';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

/**
 * Payment section component created with makeSection.
 * Handles payment method selection for checkout.
 */
export const PaymentSection = makeSection<
  'payment',
  PaymentFormData,
  PaymentFormData
>({
  id: 'payment',
  required: true,
  Component,
  selector: (state: CheckoutState) =>
    (state.sections.payment?.data ?? null) as PaymentFormData | null,
  displayName: 'PaymentSection',
});
