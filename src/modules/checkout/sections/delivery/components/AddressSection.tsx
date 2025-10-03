'use client';

import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { CitySelect, type City } from './city/CitySelect';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

type AddressFormValues = { city: City | null };

function extractStoredCity(): City | null {
  const entry = useCheckoutStore.getState().sections.address;
  if (!entry || !entry.data) return null;
  const data = entry.data as { city?: City | null };
  return data?.city ?? null;
}

/**
 * Address section component.
 * Keeps selected city in local RHF form and syncs it with checkout store.
 */
export const AddressSection = () => {
  const { publishValid, publishInvalid } = useSectionController('address', { required: true });
  const storedCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as { city?: City | null } | undefined;
    return data?.city ?? null;
  });

  const methods = useForm<AddressFormValues>({
    defaultValues: { city: extractStoredCity() },
    mode: 'onChange',
  });
  const city = useWatch({ control: methods.control, name: 'city' });

  useEffect(() => {
    methods.setValue('city', storedCity ?? null, { shouldDirty: false, shouldTouch: false });
  }, [storedCity, methods]);

  useEffect(() => {
    if (city) {
      publishValid({ city });
    } else {
      publishInvalid({ city: 'required' });
    }
  }, [city, publishValid, publishInvalid]);

  return (
    <FormProvider {...methods}>
      <CitySelect
        value={city ?? null}
        onChange={(nextCity) => methods.setValue('city', nextCity, { shouldDirty: true, shouldTouch: true })}
      />
    </FormProvider>
  );
};

export default AddressSection;
