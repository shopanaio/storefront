'use client';

import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState, type ReactNode } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import { ImageFan } from '#checkout/ui/ImageFan';
import { composeProductTitle } from '#checkout/ui/composeProductTitle';
import type { Checkout } from '#checkout/types/entity';
import { ShipmentLines } from './ShipmentLines';

const { Text } = Typography;

export interface ShipmentPlateProps {
  /** "Shipment 1 of 3". Without it the plate opens on the pictures alone, as the order summary does. */
  title?: string;
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
  const { styles, cx } = useStyles();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const listId = useId();
  const toggle = () => setExpanded((value) => !value);
  const quantity = lines.reduce((total, line) => total + line.quantity, 0);

  const avatars = (
    <Flex align="center" gap={12} className={styles.avatars}>
      <ImageFan
        images={lines.map((line) => ({
          key: line.id,
          src: line.imageSrc ?? line.purchasable?.cover?.url,
          alt: composeProductTitle({
            productTitle: line.purchasable?.product?.title,
            variantTitle: line.purchasable?.title ?? line.title,
            fallback: line.title,
          }),
        }))}
      />
      <Text type="secondary" className={styles.count}>
        {t('delivery-shipment-items', { count: quantity })}
      </Text>
    </Flex>
  );

  return (
    <Flex vertical className={styles.plate}>
      <Flex align={title ? 'flex-start' : 'center'} gap={12}>
        <Flex vertical className={styles.summary} onClick={toggle}>
          {title ? <Text strong>{title}</Text> : null}
          <div
            className={cx(styles.collapse, !expanded && styles.open)}
            inert={expanded}
          >
            <div className={styles.collapseInner}>{avatars}</div>
          </div>
        </Flex>
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
        <Button
          type="text"
          size="small"
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={listId}
          aria-label={t(
            expanded ? 'delivery-shipment-collapse' : 'delivery-shipment-expand'
          )}
          icon={
            <TbChevronDown
              className={cx(styles.chevron, expanded && styles.chevronUp)}
            />
          }
          onClick={toggle}
        />
      </Flex>
      <div
        id={listId}
        className={cx(styles.collapse, expanded && styles.open)}
        inert={!expanded}
      >
        <div className={styles.collapseInner}>
          <div className={styles.lines}>
            <ShipmentLines lines={lines} undeliverable={undeliverable} />
          </div>
        </div>
      </div>
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
  // The rows animate their height: the avatars fold while the list unfolds, so nothing jumps.
  collapse: css`
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows ${token.motionDurationMid} ease,
      opacity ${token.motionDurationMid} ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  `,
  open: css`
    grid-template-rows: 1fr;
    opacity: 1;
  `,
  collapseInner: css`
    overflow: hidden;
    min-height: 0;
  `,
  avatars: css`
    padding-top: ${token.paddingXXS}px;
  `,
  count: css`
    font-size: ${token.fontSizeSM}px;
  `,
  action: css`
    flex: none;
    height: auto;
    padding: 0;
  `,
  toggle: css`
    flex: none;
    color: ${token.colorTextSecondary};
  `,
  chevron: css`
    transition: transform ${token.motionDurationMid} ease;
  `,
  chevronUp: css`
    transform: rotate(180deg);
  `,
  lines: css`
    padding-top: ${token.paddingXXS}px;
  `,
}));
