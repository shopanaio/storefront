'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { SummaryItem } from '#checkout/components/summary/SummaryItem';
import type { Checkout } from '#checkout/types/entity';

/** Lines of a shipment as the order summary shows them, divided instead of framed. */
export const ShipmentLines = ({
  lines,
  priced = true,
  counted = true,
  divided = true,
}: {
  lines: Checkout.Line[];
  /** Shows the cost of each line. */
  priced?: boolean;
  /** Shows the quantity of each line. */
  counted?: boolean;
  /** Divides the lines with a rule; otherwise they stand apart by a gap. */
  divided?: boolean;
}) => {
  const { styles, cx } = useStyles();
  return (
    <Flex vertical gap={divided ? 0 : 16}>
      {lines.map((line) => (
        <SummaryItem
          key={line.id}
          line={line}
          bordered={false}
          priced={priced}
          counted={counted}
          className={cx(divided && styles.divided)}
        />
      ))}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  divided: css`
    padding: ${token.paddingSM}px 0;

    & + & {
      border-top: 1px solid ${token.colorBorderSecondary};
    }
  `,
}));
