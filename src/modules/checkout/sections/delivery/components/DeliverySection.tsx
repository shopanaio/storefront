'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useFormContext } from 'react-hook-form';
import { AddressSection } from './AddressSection';
import { ShippingMethods } from './ShippingMethods';
import type { CheckoutFormValues } from '@src/modules/checkout/components/Checkout';

/**
 * Delivery section component.
 * Combines address and shipping methods.
 */
export const DeliverySection = () => {
  const { styles } = useStyles();
  const form = useFormContext<CheckoutFormValues>();

  // Access cart data from form's internal state or external context
  const deliveryMethods = (form as any).cart?.deliveryGroups?.[0]?.deliveryMethods;

  return (
    <Flex vertical gap={12} className={styles.container}>
      <AddressSection />
      {deliveryMethods && <ShippingMethods methods={deliveryMethods} />}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default DeliverySection;
