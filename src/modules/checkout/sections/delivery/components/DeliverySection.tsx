'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import { AddressSection } from './AddressSection';
import { ShippingMethods } from './ShippingMethods';
import type { CheckoutFormValues } from '@src/modules/checkout/components/Checkout';

/**
 * Delivery section component.
 * Combines address and shipping methods.
 */
export const DeliverySection = () => {
  const { styles } = useStyles();
  const { cart } = useCheckoutData();
  const deliveryGroups = (cart as any)?.deliveryGroups ?? [];

  return (
    <Flex vertical gap={12} className={styles.container}>
      <AddressSection />
      {deliveryGroups.map((g: any) => (
        <ShippingMethods key={g.id} groupId={g.id} methods={g.deliveryMethods || []} />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default DeliverySection;
