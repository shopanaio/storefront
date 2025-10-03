'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
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
  const { cart } = useCheckoutData();
  const deliveryGroups = (cart as any)?.deliveryGroups ?? [];
  const addressCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as { city?: City | null } | undefined;
    return data?.city ?? null;
  });

  return (
    <Flex vertical gap={12} className={styles.container}>
      <AddressSection />
      {deliveryGroups.map((g: any) => (
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
