'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ShippingMethodsRenderer } from './ShippingMethodsRenderer';
import { useCheckoutDeliveryGroups } from '@src/modules/checkout/hooks/useCheckoutDataSources';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import type { City } from './city/CitySelect';
import type { DeliveryFormData } from '../types';

/**
 * View component for the delivery section.
 *
 * Pure controlled UI component that renders the delivery form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 *
 * @template TFormData - The form data type containing all form fields
 */
export interface DeliverySectionViewProps<TFormData = DeliveryFormData> {
  /** Current form data */
  value: TFormData | null;
  /** Called when form data is valid */
  onValid: (data: TFormData) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const DeliverySectionView = ({
  value,
  onValid,
  onInvalid,
}: DeliverySectionViewProps<DeliveryFormData>) => {
  const { styles } = useStyles();
  const deliveryGroups = useCheckoutDeliveryGroups();

  /**
   * Get currently selected city from address section
   */
  const addressCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as { city?: City | null } | undefined;
    return data?.city ?? null;
  });

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
