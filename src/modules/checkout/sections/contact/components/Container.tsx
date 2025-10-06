import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { ContactDto } from '@src/modules/checkout/core/contracts/dto';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

/**
 * Contact section component created with makeSection.
 * Handles contact information for checkout.
 */
export const ContactSection = makeSection<
  'contact',
  ContactDto,
  ContactDto
>({
  id: 'contact',
  required: true,
  Component,
  selector: (state: CheckoutState) =>
    (state.sections.contact?.data ?? null) as ContactDto | null,
  displayName: 'ContactSection',
});
