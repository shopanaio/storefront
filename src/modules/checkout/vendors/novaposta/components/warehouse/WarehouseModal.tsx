import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getWarehouses, type GetWarehousesRequest, type WarehouseData } from '../../api';
import { Warehouse } from '../../types';
import { WarehouseModalItem } from './WarehouseModalItem';
import { SelectButton } from '@checkout/components/common/SelectButton';
import { DrawerBase } from '@src/components/UI/DrawerBase';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { useIsMobile } from '@src/hooks/useIsMobile';

interface Props {
  warehouse: Warehouse | null;
  changeWarehouse: (warehouse: Warehouse) => void;
  cityName: string | null;
}

const formatSchedule = (schedule: Record<string, string> | string): string => {
  if (typeof schedule === 'string') return schedule;

  if (typeof schedule === 'object' && schedule !== null) {
    const timeGroups: { [time: string]: string[] } = {};

    Object.entries(schedule).forEach(([day, time]) => {
      if (time && time !== '0') {
        if (!timeGroups[time]) {
          timeGroups[time] = [];
        }
        timeGroups[time].push(day);
      }
    });

    const formattedGroups = Object.entries(timeGroups).map(([time, days]) => {
      const dayNames: { [key: string]: string } = {
        Monday: 'Mon',
        Tuesday: 'Tue',
        Wednesday: 'Wed',
        Thursday: 'Thu',
        Friday: 'Fri',
        Saturday: 'Sat',
        Sunday: 'Sun',
      };

      const sortedDays = days.sort((a, b) => {
        const order = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ];
        return order.indexOf(a) - order.indexOf(b);
      });

      let result = '';
      let startDay = sortedDays[0];
      let endDay = sortedDays[0];

      for (let i = 1; i < sortedDays.length; i++) {
        const currentDay = sortedDays[i];
        const prevDay = sortedDays[i - 1];

        if (
          sortedDays.indexOf(currentDay) ===
          sortedDays.indexOf(prevDay) + 1
        ) {
          endDay = currentDay;
        } else {
          if (startDay === endDay) {
            result += `${dayNames[startDay]}-${dayNames[endDay]}: ${time} `;
          } else {
            result += `${dayNames[startDay]}-${dayNames[endDay]}: ${time} `;
          }
          startDay = currentDay;
          endDay = currentDay;
        }
      }

      if (startDay === endDay) {
        result += `${dayNames[startDay]}: ${time} `;
      } else {
        result += `${dayNames[startDay]}-${dayNames[endDay]}: ${time} `;
      }

      return result.trim();
    });

    return formattedGroups.join(' ') || 'Schedule not specified';
  }

  return 'Schedule not specified';
};

export const WarehouseModal = ({
  warehouse,
  changeWarehouse,
  cityName,
}: Props) => {
  const { styles } = useStyles();
  const isMobile = useIsMobile();
  const t = useTranslations('Checkout');

  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      if (!cityName) return;

      setIsLoading(true);
      try {
        const request: GetWarehousesRequest = {
          CityName: cityName,
          Limit: '150',
          Page: '1',
        };

        const result = await getWarehouses(request);
        setWarehouses(result.data || []);
      } catch {
        setWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isWarehouseModalVisible && cityName) {
      fetchWarehouses();
    }
  }, [isWarehouseModalVisible, cityName]);

  const items = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    return normalized.length === 0
      ? warehouses
      : warehouses.filter(
          (item) =>
            item.ShortAddress.toLowerCase().includes(normalized) ||
            item.Number.toLowerCase().includes(normalized)
        );
  }, [searchValue, warehouses]);

  const handleSelectWarehouse = (item: WarehouseData) => {
    const warehouseData: Warehouse = {
      id: item.Ref,
      Number: item.Number,
      ShortAddress: item.ShortAddress,
      TypeOfWarehouse: item.TypeOfWarehouse,
      Schedule: formatSchedule(item.Schedule),
      CityRef: item.CityRef,
      CityName: item.CityDescription,
      RegionCity: item.RegionCity,
    } as any;

    changeWarehouse(warehouseData);
    setIsWarehouseModalVisible(false);
    setSearchValue('');
  };

  return (
    <>
      <SelectButton
        hasValue={!!warehouse}
        mainText={
          warehouse
            ? `№${warehouse.Number} ${warehouse.ShortAddress}`
            : undefined
        }
        secondaryText={warehouse?.Schedule}
        placeholder={t('warehouse')}
        onClick={() => setIsWarehouseModalVisible(true)}
        disabled={!cityName}
      />
      <DrawerBase
        open={isWarehouseModalVisible}
        onClose={() => setIsWarehouseModalVisible(false)}
        engine={isMobile ? 'overlay' : 'vaul'}
        header={
          <DrawerBase.Header vertical gap={8}>
            <Flex gap={8} justify="space-between" align="center" style={{ width: '100%' }}>
              <DrawerBase.Title>{t('warehouse')}</DrawerBase.Title>
              <DrawerBase.CloseButton />
            </Flex>
            <FloatingLabelInput
              label={t('select-warehouse')}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={!cityName}
            />
          </DrawerBase.Header>
        }
      >
        <Flex className={styles.modalContainer} vertical>
          {isLoading && (
            <Typography.Text type="secondary">{t('loading')}</Typography.Text>
          )}
          <Flex vertical gap={4}>
            {items.map((item) => (
              <WarehouseModalItem
                key={item.Ref}
                item={item}
                changeWarehouse={handleSelectWarehouse}
              />
            ))}
          </Flex>
        </Flex>
      </DrawerBase>
    </>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    modalContainer: css``,
    modalHeader: css``,
    divider: css`
      margin: 0;
    `,
    postLogoWrapper: css`
      height: 46px;
      padding: ${token.paddingXXS}px;
      border-radius: ${token.borderRadius}px;
      border: 1px solid ${token.colorBorderSecondary};
    `,
    postLogo: css`
      height: 100%;
      border-radius: ${token.borderRadius}px;
    `,
    type: css`
      line-height: 1;
      font-size: ${token.fontSizeSM}px;
    `,
    item: css`
      display: flex;
      justify-content: flex-start;
      padding-left: 0;
      height: 60px;
    `,
  };
});
