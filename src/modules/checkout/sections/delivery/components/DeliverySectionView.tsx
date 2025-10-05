'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ApiCheckoutDeliveryMethod } from '@codegen/schema-client';
import { AddressSection } from './AddressSection';
import { ShippingMethodsRenderer } from './ShippingMethodsRenderer';
import type { City } from './city/CitySelect';

/**
 * Delivery group data
 */
export interface DeliveryGroup {
  id: string;
  deliveryMethods: ApiCheckoutDeliveryMethod[];
}

/**
 * Props for DeliverySectionView
 */
export interface DeliverySectionViewProps {
  /** Currently selected city from address section */
  addressCity: City | null;
  /** All delivery groups */
  deliveryGroups: DeliveryGroup[];
}

/**
 * View component for the delivery section.
 *
 * Pure UI component that renders address selection and shipping methods.
 * Receives all data through props.
 */
export const DeliverySectionView = ({
  addressCity,
  deliveryGroups,
}: DeliverySectionViewProps) => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <AddressSection />
      {deliveryGroups.map((group) => (
        <ShippingMethodsRenderer
          key={group.id}
          groupId={group.id}
          methods={group.deliveryMethods || []}
          addressCity={addressCity}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default DeliverySectionView;
