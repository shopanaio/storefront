'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { BTLogo } from '../Logo';
import { ProviderMethodComponentProps } from '@src/modules/checkout/vendors/types';

/**
 * Bank Transfer payment method component.
 * Includes CheckoutMethodPanel without additional form.
 * Automatically validates as valid when activated (no form required).
 */
export function BankTransferPaymentMethod({
  isActive,
  onActive,
}: ProviderMethodComponentProps) {
  const t = useTranslations('Modules.bankTransfer');

  return (
    <CheckoutMethodPanel
      title={t('payment.name')}
      description={t('payment.description')}
      isActive={isActive}
      onActive={onActive}
      brand={<BTLogo size={24} />}
      component={null}
    />
  );
}
