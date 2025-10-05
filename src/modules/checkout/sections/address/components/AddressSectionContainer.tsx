'use client';

import { useCallback, useMemo } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import type { City } from '@src/modules/checkout/sections/delivery/components/city/CitySelect';
import { AddressSectionView } from './AddressSectionView';

/**
 * Extracts stored city from checkout store
 */
function extractStoredCity(): City | null {
  const entry = useCheckoutStore.getState().sections.address;
  if (!entry || !entry.data) return null;
  const data = entry.data as { city?: City | null };
  return data?.city ?? null;
}

/**
 * Container for the checkout address section.
 *
 * Orchestrates integration with the section controller.
 * Delegates all UI rendering to AddressSectionView.
 */
export const AddressSectionContainer = () => {
  const { publishValid, publishInvalid } = useSectionController<'address'>(
    'address',
    { required: true }
  );

  const initialCity = useMemo(() => extractStoredCity(), []);

  const storedCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as
      | { city?: City | null }
      | undefined;
    return data?.city ?? null;
  });

  /**
   * Handles valid city selection from view
   */
  const handleValid = useCallback(
    (data: { city: City }) => {
      publishValid(data);
    },
    [publishValid]
  );

  /**
   * Handles invalid city selection from view
   */
  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      publishInvalid(errors);
    },
    [publishInvalid]
  );

  return (
    <AddressSectionView
      initialCity={initialCity}
      storedCity={storedCity}
      onValid={handleValid}
      onInvalid={handleInvalid}
    />
  );
};

export default AddressSectionContainer;
