'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ModuleType } from '@src/modules/registry';
import { ProviderRenderer } from '@src/modules/checkout/infra/loaders/ProviderRenderer';

/**
 * Props for PaymentSectionView
 */
export interface PaymentSectionViewProps {
  /** Methods grouped by provider */
  methodsByProvider: Record<string, Array<{ code: string; label?: string }>>;
  /** Currently selected method code */
  selectedMethodCode?: string;
  /** Current locale */
  locale: string;
  /** Callback when provider form has valid data */
  onValid: (data: unknown) => void;
  /** Callback when provider form has invalid data */
  onInvalid: (errors?: Record<string, string>) => void;
}

/**
 * View component for the payment section.
 *
 * Pure UI component that renders payment providers.
 * Receives all data through props.
 */
export const PaymentSectionView = ({
  methodsByProvider,
  selectedMethodCode,
  locale,
  onValid,
  onInvalid,
}: PaymentSectionViewProps) => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12} className={styles.container}>
      {Object.entries(methodsByProvider).map(([provider, methods]) => (
        <ProviderRenderer
          key={provider}
          moduleType={ModuleType.Payment}
          provider={provider}
          methods={methods}
          locale={locale}
          onValid={onValid}
          onInvalid={onInvalid}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PaymentSectionView;
