'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { useProviderControllerApi } from '@src/modules/checkout/state/context/ProviderControllerContext';
import { BTLogo } from '../Logo';

/**
 * Props for the BankTransferPaymentMethod component
 */
export interface BankTransferPaymentMethodProps {
  /** Whether this method is currently active */
  isActive: boolean;
  /** Callback when method is selected */
  onActivate: () => void;
}

/**
 * Bank Transfer payment method component.
 * Includes CheckoutMethodPanel without additional form.
 * Publishes valid status when activated.
 */
export function BankTransferPaymentMethod({
  isActive,
  onActivate,
}: BankTransferPaymentMethodProps) {
  const t = useTranslations('Modules.bankTransfer');
  const controller = useProviderControllerApi();

  useEffect(() => {
    if (isActive) {
      controller.publishValid(null);
    }
  }, [isActive, controller]);

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
