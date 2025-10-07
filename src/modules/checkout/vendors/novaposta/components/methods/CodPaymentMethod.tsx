'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '@checkout/components/common/CheckoutMethodPanel';
import { NPLogo } from '../Logo';
import { ProviderMethodComponentProps } from '@src/modules/checkout/vendors/types';

/**
 * NovaPoshta cash-on-delivery payment method component.
 * Includes CheckoutMethodPanel without additional form.
 * Automatically validates as valid when activated (no form required).
 */
export function CodPaymentMethod({
  isActive,
  onActive,
}: ProviderMethodComponentProps) {
  const t = useTranslations('Modules.novaposta');

  return (
    <CheckoutMethodPanel
      title={t('payment.cod')}
      description={t('payment.cod_description')}
      isActive={isActive}
      onActive={onActive}
      brand={<NPLogo size={24} />}
      component={null}
    />
  );
}
