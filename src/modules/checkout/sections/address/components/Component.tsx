'use client';

import {
  CitySelect,
  type City,
} from '@src/modules/checkout/sections/delivery/components/city/CitySelect';
import { useCallback } from 'react';
import type { AddressFormData } from '../types';

export interface AddressSectionViewProps {
  /** Current form data */
  data: AddressFormData | null;
  /** Called when form data is valid */
  onValid: (data: AddressFormData) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const AddressSectionView = ({
  data,
  onValid,
}: AddressSectionViewProps) => {
  const onChange = useCallback(
    (city: City) => {
      // Update only the city field in form data
      onValid({ ...data, city });
    },
    [onValid, data]
  );

  return <CitySelect value={data?.city ?? null} onChange={onChange} />;
};

export default AddressSectionView;
