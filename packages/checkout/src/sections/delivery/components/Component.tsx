'use client';

import { Flex } from 'antd';
import { useEffect, useMemo } from 'react';
import type { DeliveryFormData } from '../types';
import { pruneCustomerInputs } from '../customerInputStorage';
import { useAddressLoading } from '../useAddressLoading';
import { DeliveryMethodList } from './DeliveryMethodList';
import { DeliveryMethodsSkeleton } from './DeliveryMethodsSkeleton';
import { Shipments } from './Shipments';
import { UndeliverableLines } from './UndeliverableLines';

/**
 * View component for the delivery section.
 *
 * One delivery group is a plain list of methods. Several groups are shipments of one order
 * to one address (R1); the backend decides how the lines are split and the section shows
 * the groups as they come. Groups with no method for the address block the order (R7).
 */
export interface DeliverySectionViewProps {
  /** Current form data */
  data: DeliveryFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

export const DeliverySectionView = ({ data }: DeliverySectionViewProps) => {
  const groups = useMemo(() => Object.values(data ?? {}), [data]);
  const deliverable = useMemo(
    () => groups.filter((group) => group.deliveryMethods.length > 0),
    [groups]
  );
  // Every group has the same address; the first one stands for all of them.
  const address = groups[0]?.address ?? null;

  const groupIds = groups.map((group) => group.id).join('\n');
  useEffect(() => {
    if (groupIds) {
      pruneCustomerInputs(groupIds.split('\n'));
    }
  }, [groupIds]);

  const addressLoading = useAddressLoading();
  if (addressLoading) {
    return <DeliveryMethodsSkeleton />;
  }

  return (
    <Flex vertical gap={12}>
      <UndeliverableLines />
      {deliverable.length === 1 ? (
        <DeliveryMethodList
          key={deliverable[0].id}
          groups={deliverable}
          methods={deliverable[0].deliveryMethods}
          address={address}
        />
      ) : deliverable.length > 1 ? (
        <Shipments
          key={deliverable.map((group) => group.id).join('\n')}
          groups={deliverable}
          address={address}
        />
      ) : null}
    </Flex>
  );
};

export default DeliverySectionView;
