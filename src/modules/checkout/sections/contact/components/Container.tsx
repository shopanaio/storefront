import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';
import { SectionId } from '@src/modules/checkout/state/interface';

/**
 * Contact section component created with makeSection.
 * Handles contact information for checkout.
 */
export const ContactSection = makeSection<ContactDto>({
  id: SectionId.Contact,
  required: true,
  Component,
  selector: (state) =>
    (state.sections.contact?.data ?? null) as ContactDto | null,
  displayName: 'ContactSection',
});
