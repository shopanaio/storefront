import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { DeliveryFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';
import { mapCheckoutToDeliveryFormData } from '../mapper';

/**
 * Delivery section component created with makeSection.
 * Handles delivery method selection for checkout.
 */
export const DeliverySection = makeSection<DeliveryFormData>({
  id: SectionId.Delivery,
  required: true,
  Component,
  selector: mapCheckoutToDeliveryFormData,
  displayName: 'DeliverySection',
});
