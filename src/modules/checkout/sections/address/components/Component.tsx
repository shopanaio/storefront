'use client';

import {
  CitySelect,
} from '@src/modules/checkout/sections/delivery/components/city/CitySelect';
import type { AddressFormData } from '../types';

export interface AddressSectionViewProps {
  /** Current form data */
  data: AddressFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

export const AddressSectionView = ({
  data,
  invalidate,
}: AddressSectionViewProps) => {
  return <CitySelect value={data?.city ?? null} />;
};

export default AddressSectionView;
