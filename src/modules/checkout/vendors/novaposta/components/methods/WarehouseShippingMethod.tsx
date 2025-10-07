'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { WarehouseForm } from '../forms/WarehouseForm';
import { NPLogo } from '../Logo';
import { ProviderMethodComponentProps } from '@src/modules/checkout/vendors/types';

/**
 * NovaPoshta warehouse-to-warehouse shipping method component.
 * Includes CheckoutMethodPanel with WarehouseForm.
 */
export function WarehouseShippingMethod({
  isActive,
  onActive,
  ...componentProps
}: ProviderMethodComponentProps) {
  const t = useTranslations('Modules.novaposta');

  return (
    <CheckoutMethodPanel
      title={t('shipping.warehouse')}
      description={t('shipping.warehouse_description')}
      isActive={isActive}
      onActive={onActive}
      brand={<NPLogo size={24} />}
      component={WarehouseForm}
      componentProps={componentProps}
    />
  );
}
