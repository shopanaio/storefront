'use client';

import { Alert, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { ProviderRenderer } from '#checkout/infra/ProviderRenderer';
import { useState, useEffect, useCallback } from 'react';
import type { PaymentFormData, PaymentMethod } from '../types';
import { ProviderMethod, ProviderModuleType } from '#checkout/vendors/types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';

/**
 * View component for the payment section.
 *
 * Renders payment methods in API order, each through the UI module of its
 * provider; a method without a module is hidden (see ProviderRenderer).
 * Manages local state for optimistic UI updates while API requests are in progress.
 */
export interface PaymentSectionViewProps {
  /** Current form data */
  data: PaymentFormData | null;
}

export const PaymentSectionView = ({ data }: PaymentSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { paymentMethods = [], selectedPaymentMethod, resetReason } = data ?? {};
  const { selectPaymentMethod } = useCheckoutApi();

  /**
   * Local state for optimistic UI updates
   * This allows the UI to respond immediately while the API request is processing
   */
  const [localSelectedMethod, setLocalSelectedMethod] =
    useState<PaymentMethod | null>(selectedPaymentMethod ?? null);

  /**
   * Sync local state when data changes from API
   */
  useEffect(() => {
    setLocalSelectedMethod(selectedPaymentMethod ?? null);
  }, [selectedPaymentMethod]);

  /**
   * Handle payment method selection with optimistic update
   */
  const handleSelectMethod = useCallback(
    async (selected: ProviderMethod) => {
      const method = paymentMethods.find((m) => m.handle === selected.handle);
      if (!method) {
        return;
      }

      // Optimistically update local state for immediate UI feedback
      setLocalSelectedMethod(method);

      try {
        // Call API to persist the selection
        await selectPaymentMethod({
          methodHandle: method.handle,
          customerInput: selected.data as object | undefined,
        });
      } catch (error) {
        // On error, revert to previous state
        console.error('Failed to select payment method:', error);
        setLocalSelectedMethod(selectedPaymentMethod ?? null);
      }
    },
    [selectPaymentMethod, selectedPaymentMethod, paymentMethods]
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      {resetReason && !localSelectedMethod && (
        <Alert
          type="warning"
          showIcon
          message={resetReason.message}
          description={t('payment-selection-reset')}
        />
      )}
      {paymentMethods.map((method) => (
        <ProviderRenderer
          key={method.handle}
          moduleType={ProviderModuleType.Payment}
          provider={method.provider}
          availableMethods={[method]}
          selectedMethod={localSelectedMethod}
          onSelectMethod={handleSelectMethod}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PaymentSectionView;
