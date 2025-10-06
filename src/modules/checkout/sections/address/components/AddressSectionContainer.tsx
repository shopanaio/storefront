'use client';

import { useCallback } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import type { AddressFormData } from '../types';
import { AddressSectionView } from './AddressSectionView';

/**
 * Container for the checkout address section.
 *
 * Orchestrates integration with the section controller.
 * Works with generic form data type and delegates all UI rendering to view.
 */
export const AddressSectionContainer = () => {
  const { publishValid, publishInvalid } = useSectionController<'address'>(
    'address',
    { required: true }
  );

  const formData = useCheckoutStore((state) => {
    return (state.sections.address?.data || null) as AddressFormData | null;
  });

  /**
   * Handles valid form data from view
   */
  const handleValid = useCallback(
    (data: AddressFormData) => {
      publishValid(data);
    },
    [publishValid]
  );

  /**
   * Handles invalid form data from view
   */
  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      publishInvalid(errors);
    },
    [publishInvalid]
  );

  return (
    <AddressSectionView
      value={formData}
      onValid={handleValid}
      onInvalid={handleInvalid}
    />
  );
};

export default AddressSectionContainer;
