import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { DeliveryFormData } from '../types';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

/**
 * Delivery section component created with makeSection.
 * Handles delivery method selection for checkout.
 */
export const DeliverySection = makeSection<
  'delivery',
  DeliveryFormData,
  DeliveryFormData
>({
  id: 'delivery',
  required: true,
  Component,
  selector: (state: CheckoutState) =>
    (state.sections.delivery?.data ?? null) as DeliveryFormData | null,
  displayName: 'DeliverySection',
});
