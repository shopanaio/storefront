'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';
import { useMemo } from 'react';
import type { PaymentFormData } from '../types';
import { ProviderModuleType } from '@src/modules/checkout/vendors/types';

/**
 * View component for the payment section.
 *
 * Pure controlled UI component that renders the payment form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 */
export interface PaymentSectionViewProps {
  /** Current form data */
  data: PaymentFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

export const PaymentSectionView = ({
  data,
  invalidate,
}: PaymentSectionViewProps) => {
  const { styles } = useStyles();
  const { paymentMethods, selectedPaymentMethod } = data ?? {};

  /**
   * Group methods by provider with metadata
   */
  const methodsByProvider = useMemo(() => {
    /** Return empty object if no payment methods */
    if (!paymentMethods?.length) {
      return {};
    }

    const grouped = paymentMethods.reduce<
      Record<string, Array<{ code: string; data: unknown }>>
    >((acc, method) => {
      const { provider, code, data } = method;
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push({ code, data });
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
          methods={methods}
          selectedMethod={selectedPaymentMethod ?? null}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PaymentSectionView;
