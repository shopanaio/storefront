'use client';

import {
  CitySelect,
  type City,
} from '@src/modules/checkout/sections/delivery/components/city/CitySelect';
import { useCallback } from 'react';
import type { AddressFormData } from '../types';
import type { AnySchema } from 'yup';
import { extractYupErrors } from '@src/modules/checkout/utils/validation';

export interface AddressSectionViewProps {
  /** Current form data */
  data: AddressFormData | null;
  /** Called when form data is valid */
  onValid: () => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Validation schema */
  schema: AnySchema;
}

export const AddressSectionView = ({
  data,
  onValid,
  onInvalid,
  schema,
}: AddressSectionViewProps) => {
  const onChange = useCallback(
    async (city: City) => {
      const formData: AddressFormData = { city };

      try {
        await schema.validate(formData, { abortEarly: false });
        onValid();
      } catch (error: unknown) {
        const errors = extractYupErrors(error);
        onInvalid(errors);
      }
    },
    [onValid, onInvalid, schema]
  );

  return <CitySelect value={data?.city ?? null} onChange={onChange} />;
};

export default AddressSectionView;
