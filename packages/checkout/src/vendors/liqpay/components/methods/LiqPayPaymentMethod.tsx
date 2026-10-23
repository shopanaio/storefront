'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '#checkout/components/common/CheckoutMethodPanel';
import { ProviderMethodComponentProps } from '#checkout/vendors/types';
import { LiqPayLogo } from '../Logo';

/**
 * LiqPay payment method: a card or the wallets the store enabled, on the LiqPay page. Its
 * default description names none of them, since the store sets them up in LiqPay.
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
