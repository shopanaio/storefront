'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';

interface Prop {
  country: 'UA' | 'INTL';
}

/**
 * Payment section wrapper.
 * The payment methods are injected by parent (Checkout) via PaymentMethods component.
 */
export const PaymentSection = ({ country }: Prop) => {
  const { styles } = useStyles();

  return <Flex vertical gap={12} className={styles.container} />;
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PaymentSection;
