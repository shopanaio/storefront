import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { AddressFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';

/**
 * Address section component created with makeSection.
 * Handles city selection for checkout address.
 */
export const AddressSection = makeSection<AddressFormData>({
  id: SectionId.Address,
  required: true,
  Component,
  selector: (state) =>
    (state.sections.address?.data ?? null) as AddressFormData | null,
  displayName: 'AddressSection',
});
