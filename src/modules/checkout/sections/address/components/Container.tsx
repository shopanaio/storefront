import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { AddressFormData } from '../types';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

/**
 * Address section component created with makeSection.
 * Handles city selection for checkout address.
 */
export const AddressSection = makeSection<
  'address',
  AddressFormData,
  AddressFormData
>({
  id: 'address',
  required: true,
  Component,
  selector: (state: CheckoutState) =>
    (state.sections.address?.data ?? null) as AddressFormData | null,
  displayName: 'AddressSection',
});
