'use client';

import { Flex, Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import { Banner } from '@shopana/storefront-ui';
import { useTranslations } from 'next-intl';
import { WarehouseModal } from '../warehouse/WarehouseModal';
import { useWarehouse } from '../../api/directory';
import { readSettlementRef } from '../../address';
import { pointInput, readInput } from '../../customerInput';
import type { PointInput, PointView, Warehouse } from '../../types';
import type { ProviderDeliveryAddress } from '#checkout/vendors/types';
import { LoadingBoundary } from '#checkout/ui/LoadingBoundary';

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
  const { styles } = useStyles();
  const settlementRef = readSettlementRef(deliveryAddress);
  const input = readInput(data, type, settlementRef);
  const stored = input ? ((view as PointView | undefined) ?? null) : null;
  // Picked in another browser or before the storage was cleared: the point is read by its ref.
  const { warehouse: found, loading } = useWarehouse(
    input && !stored ? (input as PointInput).warehouseRef : null
  );
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
      {/* The point saved in the checkout is being read: its button would show it as not picked. */}
      <LoadingBoundary
        pending={loading}
        fallback={<Skeleton.Input block className={styles.skeleton} />}
      >
        <WarehouseModal
          kind={type}
          point={point}
          changeWarehouse={handleChangeWarehouse}
          settlementRef={settlementRef}
        />
      </LoadingBoundary>
      {!settlementRef && (
        <Banner tone="action" title={t('city_required_warning')} />
      )}
    </Flex>
  );
}

// Same box as the point button (SelectButton): 56px high, button radius.
const useStyles = createStyles(({ token, css, prefixCls }) => ({
  skeleton: css`
    .${prefixCls}-skeleton-input {
      height: 56px !important;
      border-radius: ${token.borderRadius}px !important;
    }
  `,
}));
