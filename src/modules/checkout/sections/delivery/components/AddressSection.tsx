'use client';

import { CitySelect } from './city/CitySelect';
import { useFormContext } from 'react-hook-form';

/**
 * Address section component.
 */
export const AddressSection = () => {
  const form = useFormContext();

  return (
    <CitySelect
      value={form.watch('userCity')}
      onChange={(c) => form.setValue('userCity', c)}
    />
  );
};

export default AddressSection;
