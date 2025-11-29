'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FloatingLabelInput } from '@src/ui-kit/FloatingLabelInput';
import { StreetModal } from '../street/StreetModal';
import { ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import { usePrevious } from 'react-use';
import type { City, Street } from '@checkout/vendors/novaposta/types';
import { debounce } from 'lodash';

interface AddressFormProps {
  data: unknown;
  onSubmit: (data: unknown) => void;
  deliveryAddress?: { city: City | null };
}

export function AddressForm({
  data,
  onSubmit,
  deliveryAddress,
}: AddressFormProps) {
  const { styles } = useStyles();
  const existingData = data as { userStreet?: Street | null; userBuilding?: string; userApartment?: string } | null;
  const methods = useForm<{
    street?: Street | null;
    building: string;
    apartment: string;
  }>({
    defaultValues: {
      street: existingData?.userStreet ?? null,
      building: existingData?.userBuilding ?? '',
      apartment: existingData?.userApartment ?? '',
    },
    mode: 'onChange',
  });
  const t = useTranslations('Modules.novaposta.form');

  const debouncedOnSubmit = useMemo(() => {
    return debounce((data: unknown) => {
      onSubmit(data);
    }, 1000);
  }, [onSubmit]);

  const { watch, setValue } = methods;
  const street = watch('street') || null;
  const building = watch('building') || '';
  const apartment = watch('apartment') || '';

  // Get city from deliveryAddress prop (passed from delivery group)
  const globalCity = deliveryAddress?.city ?? null;
  const prevCityRef = usePrevious(globalCity?.Ref ?? null);
  const cityRef = globalCity?.Ref;

  // Reset street when global city changes
  useEffect(() => {
    const currentRef = globalCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      // City changed, reset street selection
      setValue('street', null);
      debouncedOnSubmit(null);
    }
  }, [globalCity, prevCityRef, setValue]);

  const handleChangeStreet = useCallback(
    (s: Street) => {
      setValue('street', s);
      onSubmit({ userStreet: s, userBuilding: building, userApartment: apartment });
    },
    [setValue, onSubmit, building, apartment]
  );

  const handleChangeBuilding = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value: building } = e.target;
      setValue('building', building);
      debouncedOnSubmit({ userStreet: street, userBuilding: building, userApartment: apartment });
    },
    [setValue, debouncedOnSubmit, street, apartment]
  );

  const handleChangeApartment = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value: apartment } = e.target;
      setValue('apartment', apartment);
      debouncedOnSubmit({ userStreet: street, userBuilding: building, userApartment: apartment });
    },
    [setValue, debouncedOnSubmit, street, building]
  );

  return (
    <FormProvider {...methods}>
      <Flex vertical gap={12} className={styles.container}>
        <StreetModal
          street={street}
          changeStreet={handleChangeStreet}
          cityRef={cityRef}
        />
        {!globalCity && (
          <Alert message={t('city_required_warning')} type="warning" showIcon />
        )}
        <Flex gap={12}>
          <FloatingLabelInput
            label={t('building')}
            value={building}
            onChange={handleChangeBuilding}
            disabled={!globalCity}
          />
          <FloatingLabelInput
            label={t('apartment')}
            value={apartment}
            onChange={handleChangeApartment}
            disabled={!globalCity}
          />
        </Flex>
      </Flex>
    </FormProvider>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default AddressForm;
