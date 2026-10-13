'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ProviderRenderer } from '#checkout/infra/ProviderRenderer';
import { useMemo, useState, useEffect, useCallback } from 'react';
import type { PaymentFormData, PaymentMethod } from '../types';
import { ProviderModuleType } from '#checkout/vendors/types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';

/**
 * View component for the payment section.
 *
 * Pure controlled UI component that renders the payment form.
 * Manages local state for optimistic UI updates while API requests are in progress.
 */
export interface PaymentSectionViewProps {
  /** Current form data */
  data: PaymentFormData | null;
}

export const PaymentSectionView = ({ data }: PaymentSectionViewProps) => {
  const { styles } = useStyles();
  const { paymentMethods, selectedPaymentMethod } = data ?? {};
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
    async (method: { handle: string; code: string; data: unknown; provider: string }) => {
      // Find full method object from paymentMethods

      // Optimistically update local state for immediate UI feedback
      setLocalSelectedMethod(method);

      try {
        // Call API to persist the selection
        await selectPaymentMethod({
          methodHandle: method.handle,
          customerInput: method.data,
        });
      } catch (error) {
        // On error, revert to previous state
        console.error('Failed to select payment method:', error);
        setLocalSelectedMethod(selectedPaymentMethod ?? null);
      }
    },
    [selectPaymentMethod, selectedPaymentMethod, paymentMethods]
  );

  /**
   * Group methods by provider with metadata
   */
  const methodsByProvider = useMemo(() => {
    /** Return empty object if no payment methods */
    if (!paymentMethods?.length) {
      return {};
    }

    const grouped = paymentMethods.reduce<
      Record<string, Array<{ handle: string; code: string; data: unknown; provider: string }>>
    >((acc, method) => {
      const { provider, handle, code, data } = method;
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push({ handle, code, data, provider });
      return acc;
    }, {});

    return grouped;
  }, [paymentMethods]);

  return (
    <Flex vertical gap={12} className={styles.container}>
      {Object.entries(methodsByProvider).map(([provider, methods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ProviderModuleType.Payment}
          provider={provider}
          availableMethods={methods}
          selectedMethod={localSelectedMethod ?? null}
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
