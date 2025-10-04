'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { AddressForm } from '../forms/AddressForm';
import { NPLogo } from '../Logo';

/**
 * Props for the CourierShippingMethod component
 */
export interface CourierShippingMethodProps {
  /** Whether this method is currently active */
  isActive: boolean;
  /** Callback when method is selected */
  onActivate: () => void;
}

/**
 * NovaPoshta courier (warehouse-to-doors) shipping method component.
 * Includes CheckoutMethodPanel with AddressForm.
 */
export function CourierShippingMethod({
  isActive,
  onActivate,
}: CourierShippingMethodProps) {
  const t = useTranslations('Modules.novaposta');

  return (
    <CheckoutMethodPanel
      title={t('shipping.courier')}
      description={t('shipping.courier_description')}
      isActive={isActive}
      onActivate={onActivate}
      brand={<NPLogo size={24} />}
      component={AddressForm}
    />
  );
}
