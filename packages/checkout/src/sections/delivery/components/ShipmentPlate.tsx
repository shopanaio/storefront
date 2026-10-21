'use client';

import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState, type ReactNode } from 'react';
import { TbChevronDown } from 'react-icons/tb';
import { ProductImage } from '#checkout/ui/ProductImage';
import { composeProductTitle } from '#checkout/ui/composeProductTitle';
import type { Checkout } from '#checkout/types/entity';
import { ShipmentLines } from './ShipmentLines';

const { Text } = Typography;

/** Pictures shown in a collapsed shipment; the rest are counted as "+N". */
const MAX_AVATARS = 4;

export interface ShipmentPlateProps {
  /** "Shipment 1 of 3". */
  title: string;
  lines: Checkout.Line[];
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
  action,
  children,
}: ShipmentPlateProps) => {
  const t = useTranslations('Checkout');
  const { styles, cx } = useStyles();
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const toggle = () => setExpanded((value) => !value);
  const quantity = lines.reduce((total, line) => total + line.quantity, 0);

  return (
    <Flex vertical className={styles.plate}>
      <Flex align="flex-start" gap={12}>
        <Flex vertical className={styles.summary} onClick={toggle}>
          <Text strong>{title}</Text>
          <div
            className={cx(styles.collapse, !expanded && styles.open)}
            inert={expanded}
          >
            <div className={styles.collapseInner}>
              <Flex align="center" gap={12} className={styles.avatars}>
                <Flex align="center">
                  {lines.slice(0, MAX_AVATARS).map((line, index) => (
                    // The first picture lies on top, as in a fanned stack.
                    <span
                      key={line.id}
                      className={styles.avatar}
                      style={{ zIndex: MAX_AVATARS - index }}
                    >
                      <ProductImage
                        src={line.imageSrc ?? line.purchasable?.cover?.url}
                        alt={composeProductTitle({
                          productTitle: line.purchasable?.product?.title,
                          variantTitle: line.purchasable?.title ?? line.title,
                          fallback: line.title,
                        })}
                        className={styles.image}
                      />
                    </span>
                  ))}
                  {lines.length > MAX_AVATARS ? (
                    <span className={cx(styles.avatar, styles.more)}>
                      +{lines.length - MAX_AVATARS}
                    </span>
                  ) : null}
                </Flex>
                <Text type="secondary" className={styles.count}>
                  {t('delivery-shipment-items', { count: quantity })}
                </Text>
              </Flex>
            </div>
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
            <ShipmentLines lines={lines} />
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
  // Room for the white ring of the avatars, which overflow would cut.
  avatars: css`
    padding: ${token.paddingXS}px 0 2px 2px;
    margin-left: -2px;
  `,
  // A stack of thumbnails framed like the ones of the order summary.
  avatar: css`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    padding: 2px;
    overflow: hidden;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background-color: ${token.colorBgContainer};
    box-shadow: 0 0 0 2px ${token.colorBgContainer};

    & + & {
      margin-left: -8px;
    }
  `,
  image: css`
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: ${Math.max(token.borderRadius - 2, 0)}px;
  `,
  more: css`
    background-color: ${token.colorBgLayout};
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSizeSM}px;
    font-weight: 600;
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
