'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { WarehouseForm } from '../forms/WarehouseForm';
import { NPLogo } from '../Logo';

/**
 * Props for the WarehouseShippingMethod component
 */
export interface WarehouseShippingMethodProps {
  /** Whether this method is currently active */
  isActive: boolean;
  /** Callback when method is selected */
  onActivate: () => void;
  /** Callback when form has valid data */
  onValid: (data: unknown) => void;
  /** Callback when form has invalid data */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Initial form values */
  initialValues?: unknown;
}

/**
 * NovaPoshta warehouse-to-warehouse shipping method component.
 * Includes CheckoutMethodPanel with WarehouseForm.
 */
export function WarehouseShippingMethod({
  isActive,
  onActivate,
  onValid,
  onInvalid,
  initialValues,
}: WarehouseShippingMethodProps) {
  const t = useTranslations('Modules.novaposta');

  return (
    <CheckoutMethodPanel
      title={t('shipping.warehouse')}
      description={t('shipping.warehouse_description')}
      isActive={isActive}
      onActivate={onActivate}
      brand={<NPLogo size={24} />}
        component={WarehouseForm}
        componentProps={{
          onValid,
          onInvalid,
          initialValues,
        }}
    />
  );
}
