'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
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
  /** Callback when form has valid data */
  onValid: (data: unknown) => void;
  /** Callback when form has invalid data */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Initial form values */
  initialValues?: unknown;
}

/**
 * NovaPoshta cash-on-delivery payment method component.
 * Includes CheckoutMethodPanel without additional form.
 * Automatically validates as valid when activated (no form required).
 */
export function CodPaymentMethod({
  isActive,
  onActivate,
  onValid,
}: CodPaymentMethodProps) {
  const t = useTranslations('Modules.novaposta');

  useEffect(() => {
    if (isActive) {
      onValid(null);
    }
  }, [isActive, onValid]);

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
