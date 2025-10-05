'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { BTLogo } from '../Logo';

/**
 * Props for the BankTransferPaymentMethod component
 */
export interface BankTransferPaymentMethodProps {
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
 * Bank Transfer payment method component.
 * Includes CheckoutMethodPanel without additional form.
 * Automatically validates as valid when activated (no form required).
 */
export function BankTransferPaymentMethod({
  isActive,
  onActivate,
  onValid,
}: BankTransferPaymentMethodProps) {
  const t = useTranslations('Modules.bankTransfer');

  useEffect(() => {
    if (isActive) {
      onValid(null);
    }
  }, [isActive, onValid]);

  return (
    <CheckoutMethodPanel
      title={t('payment.name')}
      description={t('payment.description')}
      isActive={isActive}
      onActivate={onActivate}
      brand={<BTLogo size={24} />}
      component={null}
    />
  );
}
