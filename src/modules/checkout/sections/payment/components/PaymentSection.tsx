'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { PaymentMethods } from './PaymentMethods';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import { useMethodSelection } from '@src/modules/checkout/state/hooks/useMethodSelection';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';

/**
 * Payment section component.
 * Retrieves payment methods from form context (cart data).
 */
export const PaymentSection = () => {
  const { styles } = useStyles();
  const { cart } = useCheckoutData();
  useSectionController('payment', { required: true });

  // Access cart data from form's internal state or external context
  const paymentMethods = (cart as any)?.payment?.paymentMethods;

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
