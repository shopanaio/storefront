import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { PaymentFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';
import { mapCheckoutToPaymentFormData } from '../mapper';
import { paymentFormSchema } from '../schema';

/**
 * Payment section component created with makeSection.
 * Handles payment method selection for checkout.
 */
export const PaymentSection = makeSection<PaymentFormData>({
  id: SectionId.Payment,
  required: true,
  Component,
  selector: mapCheckoutToPaymentFormData,
  schema: paymentFormSchema,
  displayName: 'PaymentSection',
});
