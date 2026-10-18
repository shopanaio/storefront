import { Button, Collapse, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import type { Warehouse } from '../../types';
import { formatSchedule } from '../../schedule';
import { NPLogo } from '../Logo';

const { Panel } = Collapse;

interface Prop {
  item: Warehouse;
  changeWarehouse: (warehouse: Warehouse) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

export const WarehouseModalItem = ({
  item,
  changeWarehouse,
  isExpanded,
  onToggle,
}: Prop) => {
  const t = useTranslations('Modules.novaPoshta');
  const { styles } = useStyles();
  const schedule =
    formatSchedule(item.schedule, (day) => t(`schedule.days.${day}`)) ||
    t('schedule.not_specified');

  return (
    <Collapse
      className={clsx(
        styles.collapse,
        isExpanded && styles.active,
        !item.selectable && styles.disabled
      )}
      activeKey={isExpanded ? item.ref : undefined}
      onChange={onToggle}
      collapsible={item.selectable ? undefined : 'disabled'}
      ghost
      bordered={false}
    >
      <Panel
        showArrow={false}
        key={item.ref}
        header={
          <Flex gap={8} align="center" className={styles.header}>
            <NPLogo showText={false} />
            <Flex vertical align="start" gap={4} className={styles.content}>
              <Typography.Text className={styles.warehouseMain}>
                {`№${item.number} ${item.shortAddress}`}
              </Typography.Text>
              <Typography.Text className={styles.workTime} type="secondary">
                {item.selectable ? schedule : t('form.point_closed')}
              </Typography.Text>
            </Flex>
          </Flex>
        }
      >
        <Button
          type="primary"
          size="large"
          block
          disabled={!item.selectable}
          onClick={() => changeWarehouse(item)}
        >
          {t('pickup_from_here')}
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
    disabled: css`
      opacity: 0.6;
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
