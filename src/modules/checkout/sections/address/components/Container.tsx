import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { AddressFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';
import { mapCheckoutToAddressFormData } from '../mapper';
import { addressFormSchema } from '../schema';

/**
 * Address section component created with makeSection.
 * Handles city selection for checkout address.
 */
export const AddressSection = makeSection<AddressFormData>({
  id: SectionId.Address,
  required: true,
  Component,
  selector: mapCheckoutToAddressFormData,
  schema: addressFormSchema,
  displayName: 'AddressSection',
});
