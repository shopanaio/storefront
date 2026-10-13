import { Button, Collapse, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { type WarehouseData } from '../../api';
import { NPLogo } from '../Logo';
import clsx from 'clsx';

const { Panel } = Collapse;

interface Prop {
  item: WarehouseData | null;
  changeWarehouse: (warehouse: WarehouseData) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Formats warehouse schedule into a readable string format
 * @param schedule - Schedule object with days and times or a string
 * @param t - Translation function for day names
 * @returns Formatted schedule string
 */
const formatSchedule = (
  schedule: Record<string, string> | string,
  t: (key: string) => string
): string => {
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
            result += `${t(`days.${startDay}`)}-${t(`days.${endDay}`)}: ${time} `;
          } else {
            result += `${t(`days.${startDay}`)}-${t(`days.${endDay}`)}: ${time} `;
          }
          startDay = currentDay;
          endDay = currentDay;
        }
      }

      if (startDay === endDay) {
        result += `${t(`days.${startDay}`)}: ${time} `;
      } else {
        result += `${t(`days.${startDay}`)}-${t(`days.${endDay}`)}: ${time} `;
      }

      return result.trim();
    });

    return formattedGroups.join(' ') || t('not_specified');
  }

  return t('not_specified');
};

export const WarehouseModalItem = ({
  item,
  changeWarehouse,
  isExpanded,
  onToggle,
}: Prop) => {
  const t = useTranslations('Modules.novaposta.schedule');
  const tButton = useTranslations('Modules.novaposta');
  const { styles } = useStyles();

  if (!item) return null;

  const handlePickup = () => {
    changeWarehouse(item);
  };

  return (
    <Collapse
      className={clsx(styles.collapse, isExpanded && styles.active)}
      activeKey={isExpanded ? item.Ref : undefined}
      onChange={onToggle}
      ghost
      bordered={false}
    >
      <Panel
        showArrow={false}
        key={item.Ref}
        header={
          <Flex gap={8} align="center" className={styles.header}>
            <NPLogo showText={false} />
            <Flex vertical align="start" gap={4} className={styles.content}>
              <Typography.Text className={styles.warehouseMain}>
                {`№${item.Number} ${item.ShortAddress}`}
              </Typography.Text>
              <Typography.Text className={styles.workTime} type="secondary">
                {formatSchedule(item.Schedule, t)}
              </Typography.Text>
            </Flex>
          </Flex>
        }
      >
        <Button type="primary" size="large" block onClick={handlePickup}>
          {tButton('pickup_from_here')}
        </Button>
      </Panel>
    </Collapse>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    collapse: css`
      box-sizing: border-box;
      border: 1px solid;
      border-color: ${token.colorBorder};
      border-radius: ${token.borderRadius}px;
      min-height: 56px;
      overflow: visible;
      margin-bottom: ${token.marginXS}px;

      & .ant-collapse-header {
        padding: ${token.paddingSM}px !important;
        align-items: center !important;
      }

      & .ant-collapse-content-box {
        padding: ${token.paddingSM}px !important;
        padding-top: 0 !important;
      }
    `,
    active: css`
      outline: 1px solid ${token.colorPrimary};
      border-color: ${token.colorPrimary} !important;
    `,
    header: css`
      width: 100%;
      cursor: pointer;
      overflow: hidden;
    `,
    warehouseMain: css`
      line-height: 1.2;
      font-size: ${token.fontSize}px;
    `,
    workTime: css`
      font-size: ${token.fontSizeSM}px;
      line-height: 1.2;
    `,
    content: css`
      overflow: hidden;
      flex: 1;
    `,
  };
});
