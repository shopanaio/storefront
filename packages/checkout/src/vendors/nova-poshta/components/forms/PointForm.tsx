'use client';

import { Flex } from 'antd';
import { CheckoutBanner } from '#checkout/ui/banner/CheckoutBanner';
import { useTranslations } from 'next-intl';
import { WarehouseModal } from '../warehouse/WarehouseModal';
import { useWarehouse } from '../../api/directory';
import { readSettlementRef } from '../../address';
import { pointInput, readInput } from '../../customerInput';
import type { PointInput, PointView, Warehouse } from '../../types';
import type { ProviderDeliveryAddress } from '#checkout/vendors/types';

interface PointFormProps {
  type: PointInput['type'];
  data: unknown;
  view?: unknown;
  onSubmit: (data: unknown, view?: unknown) => void;
  deliveryAddress?: ProviderDeliveryAddress | null;
}

/** Branch or postomat of the settlement picked in the address. */
export function PointForm({
  type,
  data,
  view,
  onSubmit,
  deliveryAddress,
}: PointFormProps) {
  const t = useTranslations('Modules.novaPoshta.form');
  const settlementRef = readSettlementRef(deliveryAddress);
  const input = readInput(data, type, settlementRef);
  const stored = input ? ((view as PointView | undefined) ?? null) : null;
  // Picked in another browser or before the storage was cleared: the point is read by its ref.
  const found = useWarehouse(input && !stored ? (input as PointInput).warehouseRef : null);
  const point: PointView | null =
    stored ??
    (found
      ? {
          number: found.number,
          shortAddress: found.shortAddress,
          schedule: found.schedule,
        }
      : null);

  const handleChangeWarehouse = (warehouse: Warehouse) => {
    if (!settlementRef) {
      return;
    }
    const pointView: PointView = {
      number: warehouse.number,
      shortAddress: warehouse.shortAddress,
      schedule: warehouse.schedule,
    };
    onSubmit(pointInput(type, settlementRef, warehouse.ref), pointView);
  };

  return (
    <Flex vertical gap={12}>
      <WarehouseModal
        kind={type}
        point={point}
        changeWarehouse={handleChangeWarehouse}
        settlementRef={settlementRef}
      />
      {!settlementRef && (
        <CheckoutBanner tone="action" title={t('city_required_warning')} />
      )}
    </Flex>
  );
}
