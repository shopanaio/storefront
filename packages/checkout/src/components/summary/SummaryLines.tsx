'use client';

import { Button, Flex, Typography } from 'antd';
import { TbShoppingCart } from 'react-icons/tb';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { useCheckoutTheme } from '#checkout/theme';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { LINES_ANCHOR } from '#checkout/ui/focusAnchor';
import { Badge } from '#checkout/ui/Badge';
import { Fold, FoldToggle } from '#checkout/ui/Fold';
import { ImageFan, linesToFanImages } from '#checkout/ui/ImageFan';
import { Money } from '#checkout/ui/Money';
import { OptionWave } from '#checkout/ui/OptionWave';
import { useMediaQuery } from '#checkout/ui/useMediaQuery';
import { breakpoints } from '#checkout/ui/breakpoints';
import { SectionTitle } from '#checkout/components/common/SectionTitle';
import type { Checkout } from '#checkout/types/entity';
import { ShipmentLines } from '#checkout/sections/delivery/components/ShipmentLines';
import { SummaryItem } from './SummaryItem';

const { Text } = Typography;

/** Lines listed before "show more" beside the form. */
const VISIBLE_LINES = 5;

interface SummaryLinesProps {
  checkout: Checkout.Checkout;
}

/**
 * The title of the order summary over its lines. Beside the form the lines are listed; under it,
 * on a phone, they fold into their pictures with the total, and the title and the arrow unfold
 * them. Starts unfolded when a line cannot be delivered (R7). The theme's cart opens from the
 * button beside the title.
 */
export const SummaryLines = ({ checkout }: SummaryLinesProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { useOpenCart } = useCheckoutTheme();
  const openCartDrawer = useOpenCart();
  const undeliverable = new Set(useUndeliverableLines().map((line) => line.id));
  // Below lg the lines lead the page, over the form (CheckoutView).
  const stacked = useMediaQuery(`(max-width: ${breakpoints.lg - 0.05}px)`);
  const [showAll, setShowAll] = useState(false);
  const [expanded, setExpanded] = useState(() => undeliverable.size > 0);
  const listId = useId();
  const toggle = () => setExpanded((value) => !value);

  const lines = checkout.lines;
  const { totalAmount, totalDiscountAmount, loyaltyAmount } = checkout.cost;
  // What the order would cost without its promotions and what is paid with points or store
  // credit, struck through over the total; nothing when nothing was taken off.
  const reductions = totalDiscountAmount.amount + loyaltyAmount.amount;
  const beforeReductions =
    reductions > 0
      ? {
          amount: Math.round((totalAmount.amount + reductions) * 100) / 100,
          currencyCode: totalAmount.currencyCode,
        }
      : null;
  const items = (shown: Checkout.Line[]) => (
    <Flex vertical gap={8}>
      {shown.map((line) => (
        <SummaryItem
          key={line.id}
          line={line}
          undeliverable={undeliverable.has(line.id)}
        />
      ))}
    </Flex>
  );

  const action = openCartDrawer ? (
    <Button
      color="default"
      variant="text"
      onClick={(event) => {
        event.stopPropagation();
        openCartDrawer();
      }}
      icon={<TbShoppingCart size={20} />}
    />
  ) : null;

  const title = (
    <Flex align="center" gap={8} className={styles.title}>
      <SectionTitle>{t('order-summary')}</SectionTitle>
      <Badge count={checkout.totalQuantity} variant="primary" />
    </Flex>
  );

  if (!stacked) {
    const hasHidden = lines.length > VISIBLE_LINES;
    return (
      <Flex id={LINES_ANCHOR} vertical gap={8}>
        <Flex align="center" gap={8}>
          {title}
          {action}
        </Flex>
        <Flex vertical gap={8}>
          {items(showAll ? lines : lines.slice(0, VISIBLE_LINES))}
          {hasHidden ? (
            <div>
              <Button
                className={styles.moreLink}
                variant="link"
                color="primary"
                onClick={() => setShowAll((value) => !value)}
              >
                {showAll ? t('summary-show-less') : t('summary-show-more')}
              </Button>
            </div>
          ) : null}
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex id={LINES_ANCHOR} vertical gap={8}>
      <Flex align="center" gap={8} className={styles.header} onClick={toggle}>
        {title}
        <FoldToggle
          open={expanded}
          controls={listId}
          label={t(expanded ? 'summary-collapse' : 'summary-expand')}
          onClick={toggle}
        />
      </Flex>
      {/*
        The title stays over the card; in it the pictures fold while the list unfolds. A click
        anywhere on the card folds or unfolds it, with the wave of the other cards.
      */}
      <OptionWave disabled={false}>
        <div className={styles.card} onClick={toggle}>
          <Fold open={!expanded}>
            <Flex align="center" gap={8} className={styles.folded}>
              {/* The front picture stands where a thumbnail of the list does. */}
              <ImageFan
                images={linesToFanImages(lines)}
                bleed
                className={styles.fan}
              />
              <Flex vertical className={styles.caption}>
                <Text className={styles.label}>{t('total')}</Text>
                <Text type="secondary" className={styles.count}>
                  {t('delivery-shipment-items', {
                    count: checkout.totalQuantity,
                  })}
                </Text>
              </Flex>
              <Flex vertical align="flex-end" className={styles.prices}>
                {beforeReductions ? (
                  <Money
                    as={Text}
                    delete
                    type="secondary"
                    money={beforeReductions}
                    className={styles.before}
                  />
                ) : null}
                {/* The same as the price of a line in the list it folds. */}
                <Money
                  strong
                  as={Text}
                  money={checkout.cost.totalAmount}
                  className={styles.price}
                />
              </Flex>
            </Flex>
          </Fold>
          <Fold id={listId} open={expanded}>
            {/* Under the form the lines are divided, not framed, as the lines of a shipment. */}
            <ShipmentLines lines={lines} undeliverable={undeliverable} />
          </Fold>
        </div>
      </OptionWave>
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  // On a phone the pictures and the lines are a white card, framed as the other cards of the
  // checkout; the rows inside keep the space above and under them.
  card: css`
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background-color: ${token.colorBgContainer};
    padding: 0 ${token.padding}px;
    cursor: pointer;
  `,
  title: css`
    flex: 1;
    min-width: 0;
  `,
  header: css`
    cursor: pointer;
  `,
  // The space around the row is inside the fold, so a folded row leaves none.
  // The turned card on the left a little into the padding, so the fan sits by the frame.
  fan: css`
    margin-left: -2px;
  `,
  folded: css`
    padding: ${token.paddingSM}px 0;
  `,
  // Two lines as in the city and the other two-line buttons of the checkout (SelectButton).
  caption: css`
    flex: 1;
    min-width: 0;
    gap: ${token.marginXXS}px;
  `,
  // As the title of a line in the list.
  label: css`
    font-size: ${token.fontSize}px;
    font-weight: 500;
    line-height: 1;
  `,
  count: css`
    font-size: ${token.fontSizeSM}px;
    line-height: 1;
  `,
  // Two lines as the caption on the left: the amount before reductions over the total.
  prices: css`
    flex: none;
    gap: ${token.marginXXS}px;
  `,
  before: css`
    font-size: ${token.fontSizeSM}px;
    font-weight: 400;
    line-height: 1;
    white-space: nowrap;
  `,
  price: css`
    line-height: 1;
    white-space: nowrap;
  `,
  moreLink: css`
    padding: 0;
    text-decoration: underline;
  `,
}));
