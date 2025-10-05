'use client';

import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { CitySelect, type City } from '@src/modules/checkout/sections/delivery/components/city/CitySelect';
import { createStyles } from 'antd-style';

type AddressFormValues = { city: City | null };

/**
 * View component for the checkout address section.
 *
 * Pure UI component that renders the city selector and manages form state.
 */
export interface AddressSectionViewProps {
  /** Initial city value */
  initialCity: City | null;
  /** Stored city value from checkout store */
  storedCity: City | null;
  /** Called when city is selected (valid) */
  onValid: (data: { city: City }) => void;
  /** Called when city is not selected (invalid) */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const AddressSectionView = ({
  initialCity,
  storedCity,
  onValid,
  onInvalid,
}: AddressSectionViewProps) => {
  const { styles } = useStyles();

  const methods = useForm<AddressFormValues>({
    defaultValues: { city: initialCity },
    mode: 'onChange',
  });

  const city = useWatch({ control: methods.control, name: 'city' });

  // Sync from store to form (only if value changed externally)
  useEffect(() => {
    // Compare by Ref (uuid) to avoid unnecessary updates
    if (city?.Ref !== storedCity?.Ref) {
      methods.setValue('city', storedCity ?? null, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
    // Don't include methods in deps - setValue is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedCity?.Ref, city?.Ref]);

  // Validate and publish to section controller
  useEffect(() => {
    if (city?.Ref) {
      onValid({ city });
    } else {
      onInvalid({ city: 'required' });
    }
  }, [city?.Ref, onValid, onInvalid]);

  return (
    <FormProvider {...methods}>
      <div className={styles.container}>
        <CitySelect
          value={city ?? null}
          onChange={(nextCity) =>
            methods.setValue('city', nextCity, {
              shouldDirty: true,
              shouldTouch: true,
            })
          }
        />
      </div>
    </FormProvider>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default AddressSectionView;
