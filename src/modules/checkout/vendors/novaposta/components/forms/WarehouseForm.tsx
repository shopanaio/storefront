'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { WarehouseModal } from '../warehouse/WarehouseModal';
import { useEffect } from 'react';
import { usePrevious } from 'react-use';
import type { City } from '@checkout/vendors/novaposta/types';
import { Warehouse } from '@checkout/vendors/novaposta/types';

interface WarehouseFormProps {
  data: unknown;
  onSubmit: (data: unknown) => void;
  deliveryAddress?: { city?: City | null } | unknown;
}

export function WarehouseForm({
  data,
  onSubmit,
  deliveryAddress,
}: WarehouseFormProps) {
  const { styles } = useStyles();
  const methods = useForm<{ warehouse?: Warehouse | null }>({
    defaultValues: {
      warehouse: null,
      ...(data as any),
    },
    mode: 'onChange',
  });
  const t = useTranslations('Modules.novaposta.form');

  const { watch } = methods;
  const warehouse = watch('warehouse') || null;

  // Get city from deliveryAddress prop (passed from delivery group)
  const globalCity = (deliveryAddress as { city?: City | null })?.city ?? null;
  const prevCityRef = usePrevious(globalCity?.Ref ?? null);

  const handleChangeWarehouse = (w: Warehouse) => {
    methods.setValue('warehouse', w);
    onSubmit({ warehouse: w });
  };

  // Reset warehouse when global city changes
  useEffect(() => {
    const currentRef = globalCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      // City changed, reset warehouse selection
      methods.setValue('warehouse', null);
      onSubmit({ warehouse: null });
    }
  }, [globalCity, prevCityRef, methods]);

  return (
    <Flex vertical gap={12} className={styles.container}>
      <FormProvider {...methods}>
        <WarehouseModal
          warehouse={warehouse}
          changeWarehouse={handleChangeWarehouse}
          cityName={globalCity?.MainDescription || null}
        />
      </FormProvider>
      {!globalCity && (
        <Alert message={t('city_required_warning')} type="warning" showIcon />
      )}
    </Flex>
  );
}

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default WarehouseForm;
