'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useCheckoutPaymentMethods } from '@src/modules/checkout/hooks/useCheckoutDataSources';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';
import { PaymentSectionView } from './PaymentSectionView';

/**
 * Container for the payment section.
 *
 * Orchestrates integration with the payment section controller.
 * Groups methods by provider and prepares them for rendering.
 * Delegates all UI rendering to PaymentSectionView.
 */
export const PaymentSectionContainer = () => {
  const locale = useLocale();

  // Register payment section controller
  useSectionController<'payment'>('payment', { required: true });

  const paymentMethods = useCheckoutPaymentMethods();
  const { selected } = useMethodSelection('payment');

  /**
   * Group methods by provider with metadata
   */
  const methodsByProvider = useMemo(() => {
    const grouped = paymentMethods.reduce<
      Record<string, Array<{ code: string; providerId: string }>>
    >((acc, method) => {
      const provider = method.provider;
      const providerId = `payment:${provider}` as const;
      (acc[provider] ||= []).push({
        code: method.code,
        providerId,
      });
      return acc;
    }, {});
    return grouped;
  }, [paymentMethods]);

  return (
    <PaymentSectionView
      methodsByProvider={methodsByProvider}
      selectedMethodCode={selected?.code}
      locale={locale}
    />
  );
};

export default PaymentSectionContainer;
