'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import type { ProviderControllerApi } from '@src/modules/registry';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { StreetModal } from '../street/StreetModal';
import { useEffect } from 'react';
import { usePrevious } from 'react-use';
import { useCheckoutStore } from '@checkout/state/checkoutStore';
import type { City, Street } from '@checkout/vendors/novaposta/types';
import { addressSchema } from '../../schemas';
import { ValidationError } from 'yup';

/**
 * Props for AddressForm
 */
interface AddressFormProps {
  /** Controller API for validation */
  controller: ProviderControllerApi;
  /** Initial form values */
  initialValues?: unknown;
}

export function AddressForm({ controller, initialValues }: AddressFormProps) {
  const { styles } = useStyles();
  const methods = useForm<{
    userStreet?: Street | null;
    userBuilding: string;
    userApartment: string;
  }>({
    defaultValues: {
      userStreet: null,
      userBuilding: '',
      userApartment: '',
      ...(initialValues as any),
    },
    mode: 'onChange',
  });
  const t = useTranslations('Modules.novaposta.form');
  const { publishValid, publishInvalid } = controller;

  const { watch } = methods;
  const userStreet = watch('userStreet') || null;
  const userBuilding = watch('userBuilding') || '';
  const userApartment = watch('userApartment') || '';

  // Track global city from AddressSection (TODO: add interface)
  const globalCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as
      | { city?: City | null }
      | undefined;
    return data?.city ?? null;
  });
  const prevCityRef = usePrevious(globalCity?.Ref ?? null);

  // Reset street when global city changes
  useEffect(() => {
    const currentRef = globalCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      // City changed, reset street selection
      methods.setValue('userStreet', null);
    }
  }, [globalCity, prevCityRef, methods]);

  useEffect(() => {
    const validate = async () => {
      const data = {
        userStreet: userStreet,
        userBuilding: userBuilding,
        userApartment: userApartment,
      };
      try {
        await addressSchema.validate(data, { abortEarly: false });
        publishValid({ address: data });
      } catch (e) {
        const errs: Record<string, string> = {};
        if (e instanceof ValidationError) {
          for (const err of e.inner) {
            if (err.path) errs[err.path] = err.message || 'invalid';
          }
        }
        publishInvalid(errs);
      }
    };
    validate();
  }, [userStreet, userBuilding, userApartment, publishValid, publishInvalid]);

  return (
    <Flex vertical gap={12} className={styles.container}>
      <FormProvider {...methods}>
        <StreetModal
          street={userStreet}
          changeStreet={(s) => methods.setValue('userStreet', s)}
          cityRef={globalCity?.Ref}
        />
      </FormProvider>
      {!globalCity && (
        <Alert message={t('city_required_warning')} type="warning" showIcon />
      )}
      <Flex gap={12}>
        <FloatingLabelInput
          label={t('building')}
          value={userBuilding}
          onChange={(e) => methods.setValue('userBuilding', e.target.value)}
        />
        <FloatingLabelInput
          label={t('apartment')}
          value={userApartment}
          onChange={(e) => methods.setValue('userApartment', e.target.value)}
        />
      </Flex>
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default AddressForm;
