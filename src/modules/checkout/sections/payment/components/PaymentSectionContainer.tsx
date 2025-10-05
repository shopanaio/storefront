'use client';

import { useMemo, useCallback } from 'react';
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
  const sectionController = useSectionController<'payment'>('payment', { required: true });

  const paymentMethods = useCheckoutPaymentMethods();
  const { selected } = useMethodSelection('payment');

  /**
   * Group methods by provider with metadata
   */
  const methodsByProvider = useMemo(() => {
    const grouped = paymentMethods.reduce<
      Record<string, Array<{ code: string }>>
    >((acc, method) => {
      const provider = method.provider;
      (acc[provider] ||= []).push({
        code: method.code,
      });
      return acc;
    }, {});
    return grouped;
  }, [paymentMethods]);

  /**
   * Callback when provider form has valid data.
   * Publishes to section controller following enterprise validation pattern.
   */
  const handleValid = useCallback((data: unknown) => {
    sectionController.publishValid(data as any);
  }, [sectionController]);

  /**
   * Callback when provider form has invalid data.
   * Publishes to section controller following enterprise validation pattern.
   */
  const handleInvalid = useCallback((errors?: Record<string, string>) => {
    sectionController.publishInvalid(errors);
  }, [sectionController]);

  return (
    <PaymentSectionView
      methodsByProvider={methodsByProvider}
      selectedMethodCode={selected?.code}
      locale={locale}
      onValid={handleValid}
      onInvalid={handleInvalid}
    />
  );
};

export default PaymentSectionContainer;
