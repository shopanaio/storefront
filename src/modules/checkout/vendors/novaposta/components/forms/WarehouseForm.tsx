'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { WarehouseModal } from '../warehouse/WarehouseModal';
import { useEffect } from 'react';
import { usePrevious } from 'react-use';
import { useCheckoutStore } from '@checkout/state/checkoutStore';
import type { City } from '@checkout/sections/delivery/components/city/CitySelect';
import { warehouseSchema } from '../../schemas';
import { ValidationError } from 'yup';
import { Warehouse } from '@checkout/vendors/novaposta/types';

/**
 * Props for WarehouseForm
 */
interface WarehouseFormProps {
  /** Callback when form has valid data */
  onValid: (data: unknown) => void;
  /** Callback when form has invalid data */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Initial form values */
  initialValues?: unknown;
}

export function WarehouseForm({ onValid, onInvalid, initialValues }: WarehouseFormProps) {
  const { styles } = useStyles();
  const methods = useForm<{ warehouse?: Warehouse | null }>({
    defaultValues: {
      warehouse: null,
      ...(initialValues as any),
    },
    mode: 'onChange',
  });
  const t = useTranslations('Modules.novaposta.form');

  const { watch } = methods;
  const warehouse = watch('warehouse') || null;

  // Track global city from AddressSection (TODO: add interface)
  const globalCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as
      | { city?: City | null }
      | undefined;
    return data?.city ?? null;
  });
  const prevCityRef = usePrevious(globalCity?.Ref ?? null);

  // Reset warehouse when global city changes
  useEffect(() => {
    const currentRef = globalCity?.Ref ?? null;
    if (prevCityRef === currentRef) return;
    if (prevCityRef !== undefined) {
      // City changed, reset warehouse selection
      methods.setValue('warehouse', undefined);
    }
  }, [globalCity, prevCityRef, methods]);

  useEffect(() => {
    const validate = async () => {
      const data = {
        warehouse: warehouse,
      };
      try {
        await warehouseSchema.validate(data, { abortEarly: false });
        onValid(data);
      } catch (e) {
        // Validation failed - explicitly mark as invalid
        const errors: Record<string, string> = {};
        if (e instanceof ValidationError) {
          e.inner.forEach((err) => {
            if (err.path) errors[err.path] = err.message;
          });
        }
        onInvalid(errors);
      }
    };
    validate();
  }, [warehouse, onValid, onInvalid]);

  return (
    <Flex vertical gap={12} className={styles.container}>
      <FormProvider {...methods}>
        <WarehouseModal
          warehouse={warehouse}
          changeWarehouse={(w) => methods.setValue('warehouse', w)}
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
