'use client';

import { useCheckoutDeliveryGroups } from '@src/modules/checkout/hooks/useCheckoutDataSources';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import type { City } from './city/CitySelect';
import type { DeliveryGroup } from '../types';
import { DeliverySectionView } from './DeliverySectionView';

/**
 * Container for the delivery section.
 *
 * Orchestrates integration with delivery groups and address state.
 * Delegates all UI rendering to DeliverySectionView.
 */
export const DeliverySectionContainer = () => {
  const deliveryGroups = useCheckoutDeliveryGroups();

  /**
   * Get currently selected city from address section
   */
  const addressCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as { city?: City | null } | undefined;
    return data?.city ?? null;
  });

  return (
    <DeliverySectionView
      addressCity={addressCity}
      deliveryGroups={deliveryGroups}
    />
  );
};

export default DeliverySectionContainer;
