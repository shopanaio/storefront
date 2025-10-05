'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { PaymentProviderMethodsRenderer } from './PaymentProviderMethodsRenderer';

/**
 * Props for PaymentSectionView
 */
export interface PaymentSectionViewProps {
  /** Methods grouped by provider */
  methodsByProvider: Record<string, Array<{ code: string; providerId: string }>>;
  /** Currently selected method code */
  selectedMethodCode?: string;
  /** Current locale */
  locale: string;
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
}: PaymentSectionViewProps) => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12} className={styles.container}>
      {Object.entries(methodsByProvider).map(([provider, methods]) => (
        <PaymentProviderMethodsRenderer
          key={provider}
          provider={provider}
          methods={methods}
          selectedMethodCode={selectedMethodCode}
          locale={locale}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PaymentSectionView;
