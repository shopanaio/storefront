'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { useProviderControllerApi } from '@src/modules/checkout/state/context/ProviderControllerContext';
import { NPLogo } from '../Logo';

/**
 * Props for the CodPaymentMethod component
 */
export interface CodPaymentMethodProps {
  /** Whether this method is currently active */
  isActive: boolean;
  /** Callback when method is selected */
  onActivate: () => void;
}

/**
 * NovaPoshta cash-on-delivery payment method component.
 * Includes CheckoutMethodPanel without additional form.
 * Publishes valid status when activated.
 */
export function CodPaymentMethod({
  isActive,
  onActivate,
}: CodPaymentMethodProps) {
  const t = useTranslations('Modules.novaposta');
  const controller = useProviderControllerApi();

  useEffect(() => {
    if (isActive) {
      controller.publishValid(null);
    }
  }, [isActive, controller]);

  return (
    <CheckoutMethodPanel
      title={t('payment.cod')}
      description={t('payment.cod_description')}
      isActive={isActive}
      onActivate={onActivate}
      brand={<NPLogo size={24} />}
      component={null}
    />
  );
}
