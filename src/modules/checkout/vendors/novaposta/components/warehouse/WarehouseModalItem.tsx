import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { WarehouseData } from '../../api/NovaPoshta.types';
import { NPLogo } from '../Logo';

interface Prop {
  item: WarehouseData | null;
  changeWarehouse: (warehouse: WarehouseData) => void;
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

export const WarehouseModalItem = ({ item, changeWarehouse }: Prop) => {
  const { styles } = useStyles();

  if (!item) return null;
  return (
    <Button
      type="text"
      icon={<NPLogo showText={false} />}
      key={item?.Ref}
      className={styles.button}
      onClick={() => changeWarehouse(item)}
    >
      <Flex vertical align="start" gap={4} className={styles.content}>
        <Typography.Text className={styles.warehouseMain} ellipsis>
          {`№${item?.Number} ${item?.ShortAddress}`}
        </Typography.Text>
        <Typography.Text className={styles.workTime} type="secondary">
          {formatSchedule(item?.Schedule)}
        </Typography.Text>
      </Flex>
    </Button>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    button: css`
      display: flex;
      justify-content: flex-start;
      padding-left: ${token.paddingXS}px;
      height: 56px;
      overflow: hidden;
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
    warehouseMain: css`
      line-height: 1;
    `,
    workTime: css`
      font-size: ${token.fontSizeSM}px;
      line-height: 1;
    `,
    content: css`
      overflow: hidden;
    `,
  };
});
