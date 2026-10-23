'use client';

import { useTranslations } from 'next-intl';
import { CheckoutMethodPanel } from '#checkout/components/common/CheckoutMethodPanel';
import { NPLogo } from '../Logo';
import { ProviderMethodComponentProps } from '#checkout/vendors/types';

/**
 * NovaPoshta cash-on-delivery payment method component.
 * Includes CheckoutMethodPanel without additional form.
 * Automatically validates as valid when activated (no form required).
 * The title and description of the API are shown as they are (decision 5.1); the module
 * texts stand in only when the API gives none (or only the method code).
 */
export function CodPaymentMethod({
  isActive,
  onActive,
  title,
  description,
}: ProviderMethodComponentProps) {
  const t = useTranslations('Modules.novaPoshta');

  return (
    <CheckoutMethodPanel
      title={title && title !== 'nova-poshta-cod' ? title : t('payment.cod')}
      description={description || t('payment.cod_description')}
      isActive={isActive}
      onActive={onActive}
      brand={<NPLogo size={24} />}
      component={null}
    />
  );
}
