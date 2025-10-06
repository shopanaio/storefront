'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ModuleType } from '@src/modules/registry';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';
import { useLocale } from 'next-intl';
import { useMemo, useCallback } from 'react';
import { useCheckoutPaymentMethods } from '@src/modules/checkout/hooks/useCheckoutDataSources';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';
import type { PaymentFormData } from '../types';

/**
 * View component for the payment section.
 *
 * Pure controlled UI component that renders the payment form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 *
 * @template TFormData - The form data type containing all form fields
 */
export interface PaymentSectionViewProps<TFormData = PaymentFormData> {
  /** Current form data */
  value: TFormData | null;
  /** Called when form data is valid */
  onValid: (data: TFormData) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const PaymentSectionView = ({
  value,
  onValid,
  onInvalid,
}: PaymentSectionViewProps<PaymentFormData>) => {
  const { styles } = useStyles();
  const locale = useLocale();
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

  const handleValid = useCallback(
    (data: unknown) => {
      onValid(data as PaymentFormData);
    },
    [onValid]
  );

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
          moduleType={ModuleType.Payment}
          provider={provider}
          methods={methods}
          locale={locale}
          onValid={handleValid}
          onInvalid={handleInvalid}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PaymentSectionView;
