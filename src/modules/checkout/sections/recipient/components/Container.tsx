import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { RecipientFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';
import { mapCheckoutToRecipientFormData } from '../mapper';
import { recipientFormSchema } from '../schema';

/**
 * Recipient section component created with makeSection.
 * Handles recipient information for checkout.
 *
 * Note: The initial 'required' is set to true, but Component dynamically
 * updates it via setSectionRequired based on the 'self' flag:
 * - self=true (I am recipient): required=false
 * - self=false (another person): required=true
 */
export const RecipientSection = makeSection<RecipientFormData>({
  id: SectionId.Recipient,
  required: true,
  Component,
  selector: mapCheckoutToRecipientFormData,
  schema: recipientFormSchema,
  displayName: 'RecipientSection',
});
