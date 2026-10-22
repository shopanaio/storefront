import { Button, Collapse, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { selectedDeclarations } from '#checkout/ui/selected';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { OptionWave } from '#checkout/ui/OptionWave';
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
    <OptionWave disabled={isExpanded || !item.selectable}>
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
              <Flex vertical align="start" gap={2} className={styles.content}>
                <Typography.Text className={styles.warehouseMain} ellipsis>
                  {`№${item.number} ${item.shortAddress}`}
                </Typography.Text>
                <Typography.Text className={styles.workTime} ellipsis>
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
    </OptionWave>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    collapse: css`
      box-sizing: border-box;
      border: 1px solid;
      border-color: ${token.colorBorder};
      border-radius: ${token.borderRadius}px;
      overflow: visible;
      margin-bottom: ${token.marginXS}px;

      & .ant-collapse-header {
        padding: ${token.paddingXS}px ${token.paddingSM}px !important;
        align-items: center !important;
      }

      & .ant-collapse-content-box {
        padding: ${token.paddingSM}px !important;
        padding-top: 0 !important;
      }
    `,
    active: css`
      ${selectedDeclarations(token)}
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
    // Lighter than the address, on one line (the schedule is short, see formatSchedule).
    workTime: css`
      font-size: ${token.fontSizeSM}px;
      line-height: 1.2;
      color: ${token.colorTextTertiary};
    `,
    content: css`
      overflow: hidden;
      flex: 1;
      min-width: 0;

      & > .ant-typography {
        max-width: 100%;
      }
    `,
  };
});
