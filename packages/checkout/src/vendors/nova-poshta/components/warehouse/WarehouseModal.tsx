import { Button, Flex } from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useWarehouseList } from '../../api/directory';
import type { PointView, Warehouse } from '../../types';
import { formatSchedule } from '../../schedule';
import { WarehouseModalItem } from './WarehouseModalItem';
import { DirectoryNotice } from '../DirectoryNotice';
import { SelectButton } from '#checkout/components/common/SelectButton';
import { DrawerBase } from '#checkout/ui/DrawerBase';
import { FloatingLabelInput } from '#checkout/ui/FloatingLabelInput';

interface Props {
  /** Branches or postomats: the list shows only points of this kind. */
  kind: Warehouse['kind'];
  /** The picked point, if any. */
  point: PointView | null;
  changeWarehouse: (warehouse: Warehouse) => void;
  settlementRef: string | null;
}

export const WarehouseModal = ({
  kind,
  point,
  changeWarehouse,
  settlementRef,
}: Props) => {
  const t = useTranslations('Modules.novaPoshta');

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [expandedRef, setExpandedRef] = useState<string | null>(null);
  const list = useWarehouseList(settlementRef, searchValue, open, kind);
  const { items } = list;

  const close = () => {
    setOpen(false);
    setExpandedRef(null);
  };

  const handleSelectWarehouse = (item: Warehouse) => {
    changeWarehouse(item);
    close();
    setSearchValue('');
  };

  return (
    <>
      <SelectButton
        hasValue={!!point}
        mainText={point ? `№${point.number} ${point.shortAddress}` : undefined}
        secondaryText={
          point
            ? formatSchedule(point.schedule, (day) => t(`schedule.days.${day}`))
            : undefined
        }
        placeholder={t(`form.${kind}`)}
        onClick={() => setOpen(true)}
        disabled={!settlementRef}
      />
      <DrawerBase
        open={open}
        onClose={close}
        header={
          <DrawerBase.Header vertical gap={8}>
            <Flex gap={8} justify="space-between" align="center" style={{ width: '100%' }}>
              <DrawerBase.Title>{t(`form.${kind}`)}</DrawerBase.Title>
              <DrawerBase.CloseButton />
            </Flex>
            <FloatingLabelInput
              label={t('form.search_point')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={!settlementRef}
            />
          </DrawerBase.Header>
        }
      >
        <Flex vertical gap={4}>
          {items.map((item) => (
            <WarehouseModalItem
              key={item.ref}
              item={item}
              changeWarehouse={handleSelectWarehouse}
              isExpanded={expandedRef === item.ref}
              onToggle={() =>
                setExpandedRef(expandedRef === item.ref ? null : item.ref)
              }
            />
          ))}
          <DirectoryNotice
            loading={list.loading}
            error={list.error}
            empty={list.page > 0 && !list.hasNextPage && items.length === 0}
            onRetry={list.retry}
          />
          {list.hasNextPage && !list.loading && !list.error && (
            <Button block onClick={list.loadMore}>
              {t('form.load_more')}
            </Button>
          )}
        </Flex>
      </DrawerBase>
    </>
  );
};
