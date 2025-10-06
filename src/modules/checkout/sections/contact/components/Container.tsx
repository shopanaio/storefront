import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { ContactFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';
import { mapCheckoutToContactFormData } from '../mapper';
import { contactFormSchema } from '../schema';

/**
 * Contact section component created with makeSection.
 * Handles contact information for checkout.
 */
export const ContactSection = makeSection<ContactFormData>({
  id: SectionId.Contact,
  required: true,
  Component,
  selector: mapCheckoutToContactFormData,
  schema: contactFormSchema,
  displayName: 'ContactSection',
});
