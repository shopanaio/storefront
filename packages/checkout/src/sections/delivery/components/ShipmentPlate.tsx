'use client';

import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState, type ReactNode } from 'react';
import { Fold, FoldToggle } from '#checkout/ui/Fold';
import { ImageFan, linesToFanImages } from '#checkout/ui/ImageFan';
import type { Checkout } from '#checkout/types/entity';
import { ShipmentLines } from './ShipmentLines';

const { Text } = Typography;

export interface ShipmentPlateProps {
  /** "Shipment 1 of 3". */
  title: ReactNode;
  lines: Checkout.Line[];
  /** Lines that cannot be delivered to the address (R7). */
  undeliverable?: ReadonlySet<string>;
  /** Starts with the lines shown, such as when one of them needs attention. */
  defaultExpanded?: boolean;
  /** Action on the right: "another delivery method" or "deliver with the others". */
  action?: { label: string; icon: ReactNode; onClick: () => void } | null;
  /** Shown under the shipment, such as why its method was reset. */
  children?: ReactNode;
}

/**
 * One shipment of the order. Collapsed it shows the pictures of its lines; expanded, the lines
 * as the order summary lists them. The title and the arrow both expand it.
 */
export const ShipmentPlate = ({
  title,
  lines,
  undeliverable,
  defaultExpanded = false,
  action,
  children,
}: ShipmentPlateProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const listId = useId();
  const toggle = () => setExpanded((value) => !value);
  const quantity = lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <Flex vertical className={styles.plate}>
      <Flex align="flex-start" gap={12}>
        <Flex vertical className={styles.summary} onClick={toggle}>
          {typeof title === 'string' ? (
            <Text strong ellipsis className={styles.title}>
              {title}
            </Text>
          ) : (
            title
          )}
          {/* The pictures fold while the list unfolds, so nothing jumps. */}
          <Fold open={!expanded}>
            <Flex align="center" gap={12} className={styles.avatars}>
              <ImageFan images={linesToFanImages(lines)} />
              <Text type="secondary" className={styles.count}>
                {t('delivery-shipment-items', { count: quantity })}
              </Text>
            </Flex>
          </Fold>
        </Flex>
        <FoldToggle
          open={expanded}
          controls={listId}
          label={t(
            expanded ? 'delivery-shipment-collapse' : 'delivery-shipment-expand'
          )}
          onClick={toggle}
        />
      </Flex>
      <Fold id={listId} open={expanded}>
        <div className={styles.lines}>
          <ShipmentLines lines={lines} undeliverable={undeliverable} />
        </div>
      </Fold>
      {/* A line of its own under the shipment: beside the title it squeezed both on a phone. */}
      {action ? (
        <Button
          type="link"
          icon={action.icon}
          className={styles.action}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ) : null}
      {children}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  plate: css`
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background-color: ${token.colorBgContainer};
    padding: ${token.paddingSM}px ${token.padding}px;
  `,
  summary: css`
    flex: 1;
    min-width: 0;
    cursor: pointer;
  `,
  avatars: css`
    padding-top: ${token.paddingXXS}px;
  `,
  title: css`
    max-width: 100%;
  `,
  count: css`
    font-size: ${token.fontSizeSM}px;
    white-space: nowrap;
  `,
  action: css`
    align-self: flex-start;
    height: auto;
    margin-top: ${token.marginXS}px;
    padding: 0;
  `,
  lines: css`
    padding-top: ${token.paddingXXS}px;
  `,
}));
