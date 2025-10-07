'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { AddressForm } from '../forms/AddressForm';
import { NPLogo } from '../Logo';
import { ProviderMethodComponentProps } from '@src/modules/checkout/vendors/types';

/**
 * NovaPoshta courier (warehouse-to-doors) shipping method component.
 * Includes CheckoutMethodPanel with AddressForm.
 */
export function CourierShippingMethod({
  isActive,
  onActive,
  ...componentProps
}: ProviderMethodComponentProps) {
  const t = useTranslations('Modules.novaposta');

  return (
    <CheckoutMethodPanel
      title={t('shipping.courier')}
      description={t('shipping.courier_description')}
      isActive={isActive}
      onActive={onActive}
      brand={<NPLogo size={24} />}
      component={AddressForm}
      componentProps={componentProps}
    />
  );
}
