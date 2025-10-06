'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ShippingMethodsRenderer } from './ShippingMethodsRenderer';
import type { City } from './city/CitySelect';
import type { DeliveryGroup } from '../types';

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
 * Pure UI component that renders shipping methods.
 * Receives all data through props.
 */
export const DeliverySectionView = ({
  addressCity,
  deliveryGroups,
}: DeliverySectionViewProps) => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12} className={styles.container}>
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
