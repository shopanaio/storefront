'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { ShippingMethodsRenderer } from './ShippingMethodsRenderer';
import { useCheckoutDeliveryGroups } from '@src/modules/checkout/hooks/useCheckoutDataSources';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import type { City } from './city/CitySelect';
import type { DeliveryFormData } from '../types';
import { DeliveryDto } from '@src/modules/checkout/core/contracts/dto';

/**
 * View component for the delivery section.
 *
 * Pure controlled UI component that renders the delivery form.
 * Receives generic form data and extracts needed fields.
 * Does not manage its own state - all state is controlled via props.
 *
 * @template TFormData - The form data type containing all form fields
 */
export interface DeliverySectionViewProps {
  /** Current form data */
  value: DeliveryFormData | null;
  /** Called when form data is valid */
  onValid: (data: DeliveryDto) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const DeliverySectionView = ({
  value,
  onValid,
  onInvalid,
}: DeliverySectionViewProps) => {
  const { styles } = useStyles();
  const deliveryGroups = useCheckoutDeliveryGroups();

  /**
   * Get currently selected city from address section
   */
  const addressCity = useCheckoutStore((state) => {
    const data = state.sections.address?.data as
      | { city?: City | null }
      | undefined;
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
          onValid={onValid as unknown as (data: unknown) => void}
          onInvalid={onInvalid}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default DeliverySectionView;
