'use client';

import type { FC } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { formatMoney } from '#checkout/ui/Money';
import { CheckoutMethodPanel } from '#checkout/components/common/CheckoutMethodPanel';
import { contractBranch } from '#checkout/utils/jsonSchema';
import type { ProviderMethodComponentProps } from '#checkout/vendors/types';
import { DoorForm } from '../forms/DoorForm';
import { PointForm } from '../forms/PointForm';
import { NPLogo } from '../Logo';
import { SERVICE_RECEIVING_TYPE } from '../../customerInput';
import type { ServiceCode } from '../../types';

interface NovaPoshtaPublicData {
  payer?: 'Sender' | 'Recipient';
  estimatedCost?: { amountMinor: string; currencyCode: string } | null;
}

/**
 * What the customer pays the carrier. The checkout never collects the Nova Poshta fee: when
 * the recipient pays, the carrier price is an estimate paid on receipt and may still be
 * unknown; when the merchant pays, or free shipping pays the carrier for this option, there is
 * nothing to say here.
 */
function useCarrierEstimate(
  publicData: unknown,
  waived: boolean
): string | null {
  const t = useTranslations('Modules.novaPoshta');
  const locale = useLocale();
  const data = (publicData ?? {}) as NovaPoshtaPublicData;
  if (waived || data.payer !== 'Recipient') {
    return null;
  }
  const cost = data.estimatedCost;
  return cost
    ? t('shipping.estimate', {
        amount: formatMoney(locale, {
          amount: Number(cost.amountMinor) / 100,
          currencyCode: cost.currencyCode,
        } as Parameters<typeof formatMoney>[1]),
      })
    : t('shipping.estimate_pending');
}

/**
 * Method component of a Nova Poshta service. The form follows the receiving type of the
 * service: a branch or a postomat from the directory, or a courier address. The option is
 * hidden when its contract has no branch for that type.
 *
 * A title the API gives in words wins; today the app returns the service code there. The
 * description is the carrier price estimate, never a price of the order.
 */
export function createShippingMethod(
  code: ServiceCode
): FC<ProviderMethodComponentProps> {
  const type = SERVICE_RECEIVING_TYPE[code];
  function NovaPoshtaShippingMethod({
    title,
    isActive,
    onActive,
    customerInputContract,
    data,
    view,
    onSubmit,
    deliveryAddress,
    publicData,
    carrierChargeWaived = false,
  }: ProviderMethodComponentProps) {
    const t = useTranslations('Modules.novaPoshta');
    const estimate = useCarrierEstimate(publicData, carrierChargeWaived);

    if (!contractBranch(customerInputContract, type)) {
      return null;
    }

    return (
      <CheckoutMethodPanel
        title={title && title !== code ? title : t(`shipping.services.${code}`)}
        description={estimate}
        isActive={isActive}
        onActive={onActive}
        brand={<NPLogo size={24} />}
        component={type === 'DOOR' ? DoorForm : PointForm}
        componentProps={{ data, view, onSubmit, deliveryAddress, type }}
      />
    );
  }
  NovaPoshtaShippingMethod.displayName = `NovaPoshtaShippingMethod(${code})`;
  return NovaPoshtaShippingMethod;
}
