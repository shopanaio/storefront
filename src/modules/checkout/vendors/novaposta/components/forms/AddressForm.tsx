'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { StreetModal } from '../street/StreetModal';
import * as yup from 'yup';
import { useEffect } from 'react';
import { useProviderControllerApi } from '@src/modules/checkout/state/context/ProviderControllerContext';

export function AddressForm() {
  const { styles } = useStyles();
  const methods = useForm<{
    userCity?: any;
  }>({
    defaultValues: {
      userCity: undefined,
    },
    mode: 'onChange',
  });
  const t = useTranslations('Modules.novaposta.form');
  const { publishValid, publishInvalid } = useProviderControllerApi();

  const schema = yup.object({
    userCity: yup.mixed().required('required'),
    userStreet: yup.mixed().required('required'),
    userBuilding: yup.string().trim().required('required'),
    userApartment: yup.string().optional(),
  });

  const citySelected = Boolean(methods.watch('userCity'));

  useEffect(() => {
    const data = {
      userCity: methods.watch('userCity'),
      userStreet: methods.watch('userStreet'),
      userBuilding: methods.watch('userBuilding') || '',
      userApartment: methods.watch('userApartment') || '',
    };
    (async () => {
      try {
        await schema.validate(data, { abortEarly: false });
        publishValid({ address: data });
      } catch (e: any) {
        const errs: Record<string, string> = {};
        if (e?.inner?.length) {
          for (const err of e.inner) {
            if (err.path) errs[err.path] = err.message || 'invalid';
          }
        }
        publishInvalid(errs);
      }
    })();
  }, [
    methods.watch('userCity'),
    methods.watch('userStreet'),
    methods.watch('userBuilding'),
    methods.watch('userApartment'),
    publishValid,
    publishInvalid,
  ]);

  return (
    <Flex vertical gap={12} className={styles.container}>
      <FormProvider {...methods}>
        <StreetModal
          street={methods.watch('userStreet')}
          changeStreet={(s) => methods.setValue('userStreet', s)}
          cityRef={methods.watch('userCity')?.Ref}
        />
      </FormProvider>
      {!citySelected && (
        <Alert message={t('city_required_warning')} type="warning" showIcon />
      )}
      <Flex gap={12}>
        <FloatingLabelInput
          label={t('building')}
          value={methods.watch('userBuilding')}
          onChange={(e) => methods.setValue('userBuilding', e.target.value)}
        />
        <FloatingLabelInput
          label={t('apartment')}
          value={methods.watch('userApartment')}
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
