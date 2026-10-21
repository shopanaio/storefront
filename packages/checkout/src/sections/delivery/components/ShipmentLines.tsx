'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { SummaryItem } from '#checkout/components/summary/SummaryItem';
import type { Checkout } from '#checkout/types/entity';

/** Lines of a shipment as the order summary shows them, divided instead of framed. */
export const ShipmentLines = ({ lines }: { lines: Checkout.Line[] }) => {
  const { styles } = useStyles();
  return (
    <Flex vertical>
      {lines.map((line) => (
        <SummaryItem key={line.id} line={line} bordered={false} className={styles.item} />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  item: css`
    padding: ${token.paddingSM}px 0;

    & + & {
      border-top: 1px solid ${token.colorBorderSecondary};
    }
  `,
}));
