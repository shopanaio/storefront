'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useFormContext } from 'react-hook-form';
import { PaymentMethods } from './PaymentMethods';
import type { CheckoutFormValues } from '@src/modules/checkout/components/Checkout';

/**
 * Payment section component.
 * Retrieves payment methods from form context (cart data).
 */
export const PaymentSection = () => {
  const { styles } = useStyles();
  const form = useFormContext<CheckoutFormValues>();

  // Access cart data from form's internal state or external context
  const paymentMethods = (form as any).cart?.payment?.paymentMethods;

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
