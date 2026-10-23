import { makeSection } from '#checkout/components/section/makeSection';
import Component from './Component';
import { PaymentMethodsSkeleton } from './PaymentMethodsSkeleton';

import type { PaymentFormData } from '../types';
import { SectionId } from '#checkout/state/interface';
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
  fallback: <PaymentMethodsSkeleton />,
});
