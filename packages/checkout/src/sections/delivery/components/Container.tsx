import { makeSection } from '#checkout/components/section/makeSection';
import Component from './Component';
import { DeliveryMethodsSkeleton } from './DeliveryMethodsSkeleton';

import type { DeliveryFormData } from '../types';
import { SectionId } from '#checkout/state/interface';
import { mapCheckoutToDeliveryFormData } from '../mapper';
import { deliveryFormSchema } from '../schema';
import { useDeliveryFormData } from '../withCustomerInputs';

/**
 * Delivery section component created with makeSection.
 * Handles delivery method selection for checkout.
 */
export const DeliverySection = makeSection<DeliveryFormData>({
  id: SectionId.Delivery,
  required: true,
  Component,
  selector: mapCheckoutToDeliveryFormData,
  useData: useDeliveryFormData,
  schema: deliveryFormSchema,
  displayName: 'DeliverySection',
  fallback: <DeliveryMethodsSkeleton />,
});
