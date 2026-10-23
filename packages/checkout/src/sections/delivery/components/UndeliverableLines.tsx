'use client';

import { useState } from 'react';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { Banner } from '@shopana/storefront-ui';
import { useTranslations } from 'next-intl';
import { useUndeliverableLines } from '#checkout/hooks/useUndeliverableLines';
import { ShipmentLines } from './ShipmentLines';

/** Lines shown before the rest is folded under "show more". */
const VISIBLE_LINES = 3;

/**
 * Lines that cannot be delivered to the address (R7). They block the whole order; the
 * customer changes the address or removes them from the cart, after which the checkout
 * is recalculated.
 */
export const UndeliverableLines = () => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const lines = useUndeliverableLines();
  const [expanded, setExpanded] = useState(false);

  if (!lines.length) {
    return null;
  }

  const hidden = expanded ? 0 : Math.max(lines.length - VISIBLE_LINES, 0);
  const shown = hidden ? lines.slice(0, VISIBLE_LINES) : lines;

  return (
    <Banner
      tone="action"
      title={t('undeliverable-title', { count: lines.length })}
      description={t('undeliverable-hint', { count: lines.length })}
    >
      <ShipmentLines
        lines={shown}
        priced={false}
        counted={false}
        divided={false}
      />
      {hidden > 0 && (
        <div className={styles.more}>
          <Button
            type="link"
            size="small"
            className={styles.moreButton}
            onClick={() => setExpanded(true)}
          >
            {t('undeliverable-show-more', { count: hidden })}
          </Button>
        </div>
      )}
    </Banner>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  more: css`
    margin-top: ${token.paddingXXS}px;
  `,
  moreButton: css`
    padding: 0;
  `,
}));
