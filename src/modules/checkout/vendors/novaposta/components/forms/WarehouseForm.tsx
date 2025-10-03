'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { WarehouseModal } from '../warehouse/WarehouseModal';
import * as yup from 'yup';
import { useEffect } from 'react';
import { useProviderControllerApi } from '@src/modules/checkout/state/context/ProviderControllerContext';

export function WarehouseForm() {
  const { styles } = useStyles();
  const methods = useForm<{ userCity?: any; userWarehouse?: any }>({
    defaultValues: { userCity: undefined, userWarehouse: undefined },
    mode: 'onChange',
  });
  const t = useTranslations('Modules.novaposta.form');
  const { publishValid, publishInvalid } = useProviderControllerApi();

  const schema = yup.object({
    userCity: yup.mixed().required('required'),
    userWarehouse: yup.mixed().required('required'),
  });

  const citySelected = Boolean(methods.watch('userCity'));

  useEffect(() => {
    const data = {
      userCity: methods.watch('userCity'),
      userWarehouse: methods.watch('userWarehouse'),
    };
    (async () => {
      try {
        await schema.validate(data, { abortEarly: false });
        publishValid({ warehouse: data });
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
  }, [methods.watch('userCity'), methods.watch('userWarehouse'), publishValid, publishInvalid]);

  return (
    <Flex vertical gap={12} className={styles.container}>
      <FormProvider {...methods}>
        <WarehouseModal
          warehouse={methods.watch('userWarehouse')}
          changeWarehouse={(w) => methods.setValue('userWarehouse', w)}
          cityName={methods.watch('userCity')?.MainDescription}
        />
      </FormProvider>
      {!citySelected && (
        <Alert
          message={t('city_required_warning')}
          type="warning"
          showIcon
        />
      )}
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default WarehouseForm;
