'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';
import { useMemo, useCallback } from 'react';
import type { PaymentFormData } from '../types';
import { ProviderModuleType } from '@src/modules/checkout/vendors/types';
import type { AnySchema } from 'yup';

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
  /** Called when form data is valid */
  onValid: () => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Validation schema */
  schema: AnySchema;
}

export const PaymentSectionView = ({
  data,
  onValid,
  onInvalid,
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

  const handleValid = useCallback(() => {
    onValid();
  }, [onValid]);

  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      onInvalid(errors);
    },
    [onInvalid]
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      {Object.entries(methodsByProvider).map(([provider, methods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ProviderModuleType.Payment}
          provider={provider}
          methods={methods}
          onValid={handleValid}
          onInvalid={handleInvalid}
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
