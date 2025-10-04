'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useCheckoutDeliveryGroups } from '@src/modules/checkout/hooks/useCheckoutDataSources';
import { AddressSection } from './AddressSection';
import { ShippingMethods } from './ShippingMethods';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import type { City } from './city/CitySelect';

/**
 * Delivery section component.
 * Combines address and shipping methods.
 */
export const DeliverySection = () => {
  const { styles } = useStyles();
  const deliveryGroups = useCheckoutDeliveryGroups();
  const addressCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as { city?: City | null } | undefined;
    return data?.city ?? null;
  });

  return (
    <Flex vertical gap={12} className={styles.container}>
      <AddressSection />
      {deliveryGroups.map((g) => (
        <ShippingMethods
          key={g.id}
          groupId={g.id}
          methods={g.deliveryMethods || []}
          addressCity={addressCity}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default DeliverySection;
