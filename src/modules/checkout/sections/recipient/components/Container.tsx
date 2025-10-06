import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { RecipientFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';
import { mapCheckoutToRecipientFormData } from '../mapper';
import { recipientFormSchema } from '../schema';

/**
 * Recipient section component created with makeSection.
 * Handles recipient information for checkout.
 */
export const RecipientSection = makeSection<RecipientFormData>({
  id: SectionId.Recipient,
  required: true,
  Component,
  selector: mapCheckoutToRecipientFormData,
  schema: recipientFormSchema,
  displayName: 'RecipientSection',
});
