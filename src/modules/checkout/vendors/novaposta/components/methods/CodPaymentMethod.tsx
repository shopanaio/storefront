'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { ProviderControllerApi } from '@src/modules/registry';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { NPLogo } from '../Logo';

/**
 * Props for the CodPaymentMethod component
 */
export interface CodPaymentMethodProps {
  /** Whether this method is currently active */
  isActive: boolean;
  /** Callback when method is selected */
  onActivate: () => void;
  /** Controller API for validation */
  controller: ProviderControllerApi;
  /** Initial form values */
  initialValues?: unknown;
}

/**
 * NovaPoshta cash-on-delivery payment method component.
 * Includes CheckoutMethodPanel without additional form.
 * Publishes valid status when activated.
 */
export function CodPaymentMethod({
  isActive,
  onActivate,
  controller,
}: CodPaymentMethodProps) {
  const t = useTranslations('Modules.novaposta');

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
