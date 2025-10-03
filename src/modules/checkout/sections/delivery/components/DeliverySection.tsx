'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { AddressSection } from './AddressSection';

interface Prop {
  country: 'UA' | 'INTL';
}

/**
 * Delivery section combines address and shipping methods.
 * The shipping methods are injected by parent (Checkout) via ShippingMethods component.
 */
export const DeliverySection = ({ country }: Prop) => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <AddressSection country={country} />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default DeliverySection;
