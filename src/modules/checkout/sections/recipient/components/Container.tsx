import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { RecipientFormData } from '../types';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

/**
 * Recipient section component created with makeSection.
 * Handles recipient information for checkout.
 */
export const RecipientSection = makeSection<
  'recipient',
  RecipientFormData,
  RecipientFormData
>({
  id: 'recipient',
  required: true,
  Component,
  selector: (state: CheckoutState) =>
    (state.sections.recipient?.data ?? null) as RecipientFormData | null,
  displayName: 'RecipientSection',
});
