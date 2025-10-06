'use client';

import {
  CitySelect,
  type City,
} from '@src/modules/checkout/sections/delivery/components/city/CitySelect';
import { useCallback } from 'react';
import type { AddressFormData } from '../types';

/**
 * View component for the checkout address section.
 *
 * Pure controlled UI component that renders the address form.
 * Receives generic form data and extracts needed fields (city).
 * Does not manage its own state - all state is controlled via props.
 *
 * @template TFormData - The form data type containing all form fields
 */
export interface AddressSectionViewProps<TFormData = AddressFormData> {
  /** Current form data */
  state: TFormData | null;
  /** Called when form data is valid */
  onValid: (data: TFormData) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const AddressSectionView = ({
  state,
  onValid,
}: AddressSectionViewProps<AddressFormData>) => {
  const onChange = useCallback(
    (city: City) => {
      // Update only the city field in form data
      onValid({ ...state, city });
    },
    [onValid, state]
  );

  return <CitySelect value={state?.city ?? null} onChange={onChange} />;
};

export default AddressSectionView;
