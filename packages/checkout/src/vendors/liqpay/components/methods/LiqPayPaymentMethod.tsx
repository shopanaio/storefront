'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '#checkout/components/common/CheckoutMethodPanel';
import { ProviderMethodComponentProps } from '#checkout/vendors/types';
import { LiqPayLogo } from '../Logo';

/**
 * LiqPay payment method: card, Apple Pay and Google Pay on the LiqPay page.
 * Has no form; the selection alone makes the payment section valid.
 * The title and description of the API are shown as they are (decision 5.1); the module
 * texts stand in only when the API gives none (or only the method code).
 */
export function LiqPayPaymentMethod({
  isActive,
  onActive,
  title,
  description,
}: ProviderMethodComponentProps) {
  const t = useTranslations('Modules.liqpay');

  return (
    <CheckoutMethodPanel
      title={title && title !== 'liqpay' ? title : t('payment.name')}
      description={description || t('payment.description')}
      isActive={isActive}
      onActive={onActive}
      brand={<LiqPayLogo size={24} />}
      component={null}
    />
  );
}
