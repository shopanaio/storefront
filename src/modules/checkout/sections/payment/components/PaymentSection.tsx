'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { PaymentMethods } from './PaymentMethods';
import { useCheckoutPaymentMethods } from '@src/modules/checkout/hooks/useCheckoutDataSources';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';

/**
 * Payment section component.
 * Retrieves payment methods from form context (cart data).
 */
export const PaymentSection = () => {
  const { styles } = useStyles();
  useSectionController<'payment'>('payment', { required: true });
  const paymentMethods = useCheckoutPaymentMethods();

  return (
    <Flex vertical gap={12} className={styles.container}>
      {paymentMethods && <PaymentMethods methods={paymentMethods} />}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PaymentSection;
