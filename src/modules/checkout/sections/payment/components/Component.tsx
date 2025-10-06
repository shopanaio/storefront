'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ModuleType } from '@src/modules/registry';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';
import { useLocale } from 'next-intl';
import { useMemo, useCallback } from 'react';
import type { PaymentFormData } from '../types';

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
}

export const PaymentSectionView = ({
  data,
  onValid,
  onInvalid,
}: PaymentSectionViewProps) => {
  const { styles } = useStyles();
  const locale = useLocale();
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
      Record<string, Array<{ code: string }>>
    >((acc, method) => {
      const { provider, code } = method;
      if (!acc[provider]) {
        acc[provider] = [];
      }
      acc[provider].push({ code });
      return acc;
    }, {});

    return grouped;
  }, [paymentMethods]);

  const handleValid = useCallback(() => {
    // TODO: Aggregate data for delivery groups and call onValid
    onValid();
  }, [onValid]);

  const handleInvalid = useCallback(
    (errors?: Record<string, string>) => {
      // TODO: Aggregate data for delivery groups and call onInvalid
      onInvalid(errors);
    },
    [onInvalid]
  );

  return (
    <Flex vertical gap={12} className={styles.container}>
      {Object.entries(methodsByProvider).map(([provider, methods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ModuleType.Payment}
          provider={provider}
          methods={methods}
          locale={locale}
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
