'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '#checkout/components/common/CheckoutMethodPanel';
import { ProviderMethodComponentProps } from '#checkout/vendors/types';
import { LiqPayLogo } from '../Logo';

/**
 * LiqPay payment method: card, Apple Pay and Google Pay on the LiqPay page.
 * Has no form; the selection alone makes the payment section valid.
 */
export function LiqPayPaymentMethod({
  isActive,
  onActive,
}: ProviderMethodComponentProps) {
  const t = useTranslations('Modules.liqpay');

  return (
    <CheckoutMethodPanel
      title={t('payment.name')}
      description={t('payment.description')}
      isActive={isActive}
      onActive={onActive}
      brand={<LiqPayLogo size={24} />}
      component={null}
    />
  );
}
