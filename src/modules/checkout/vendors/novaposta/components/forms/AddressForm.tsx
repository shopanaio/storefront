'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { StreetModal } from '../street/StreetModal';
import { useCallback, useEffect } from 'react';
import { usePrevious } from 'react-use';
import { useCheckoutStore } from '@checkout/state/checkoutStore';
import type { City, Street } from '@checkout/vendors/novaposta/types';
import { addressSchema } from '../../schemas';

/**
 * Props for AddressForm
 */
interface AddressFormProps {
  data: unknown;
  onSubmit: (data: unknown) => void;
}

export function AddressForm({ data, onSubmit }: AddressFormProps) {
  const { styles } = useStyles();
  const methods = useForm<{
    street?: Street | null;
    building: string;
    apartment: string;
  }>({
    defaultValues: {
      street: null,
      building: '',
      apartment: '',

      ...(data as any),
    },
    mode: 'onChange',
  });
  const t = useTranslations('Modules.novaposta.form');

  const { watch } = methods;
  const street = watch('street') || null;
  const building = watch('building') || '';
  const apartment = watch('apartment') || '';

  // Track global city from AddressSection (TODO: add interface)
  const globalCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as
      | { city?: City | null }
      | undefined;
    return data?.city ?? null;
  });
  const prevCityRef = usePrevious(globalCity?.Ref ?? null);
  const cityRef = globalCity?.Ref;

  // Reset street when global city changes
  useEffect(() => {
    const currentRef = globalCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      // City changed, reset street selection
      methods.setValue('street', null);
    }
  }, [globalCity, prevCityRef, methods]);

  useEffect(() => {
    const data = {
      street: street,
      building: building,
      apartment: apartment,
    };

    addressSchema
      .validate(data, { abortEarly: false })
      .then(() => onSubmit(data));
  }, [street, building, apartment, onSubmit]);

  const handleChangeStreet = useCallback(
    (s: Street) => {
      methods.setValue('street', s);
    },
    [methods]
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
            onChange={(e) => methods.setValue('building', e.target.value)}
          />
          <FloatingLabelInput
            label={t('apartment')}
            value={apartment}
            onChange={(e) => methods.setValue('apartment', e.target.value)}
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
