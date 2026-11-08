'use client';

import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { mq } from '@shopana/storefront-ui';

/**
 * The bar of the store's brand over the whole page, the logo on the left and `action` (the
 * cart) on the right. A white bar from edge to edge: lifted by a shadow over the grey page on a
 * phone, parted from the columns by a line on desktop, where the logo lines up with the form
 * and the action with the right edge of the summary. Needs no checkout providers: the page's
 * skeleton shows it before the checkout has loaded. Lies in a container with the column
 * variables of the checkout (`CheckoutColumns`, `CheckoutSkeleton`).
 */
export const BrandBar = ({
  children,
  action,
}: {
  children?: ReactNode;
  action?: ReactNode;
}) => {
  const { styles } = useStyles();
  if (!children && !action) return null;
  return (
    <header className={styles.header}>
      <div className={styles.brand}>{children}</div>
      <div className={styles.action}>{action}</div>
    </header>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  header: css`
    position: relative;
    z-index: 1;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginXS}px;
    height: 64px;
    padding: 0 ${token.padding}px;
    background-color: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};

    /* The tracks of the columns, so the logo and the cart line up with them. */
    ${mq.lg} {
      display: grid;
      grid-template-columns:
        minmax(0, var(--checkout-left-fr))
        minmax(0, var(--checkout-right-fr));
      gap: 0;
      height: 64px;
      padding: 0;
      border-bottom: 1px solid ${token.colorBorderSecondary};
      box-shadow:
        0 1px 0 rgba(0, 0, 0, 0.04),
        0 1px 3px rgba(0, 0, 0, 0.04);
    }
  `,
  // A flex row, so the logo stands in the middle of the bar, not on the line's baseline.
  brand: css`
    display: flex;
    align-items: center;
    min-width: 0;

    ${mq.lg} {
      box-sizing: border-box;
      width: 100%;
      max-width: var(--checkout-left-max);
      margin-left: auto;
      padding: 0 ${token.paddingXL}px;
    }
  `,
  action: css`
    display: flex;
    justify-content: flex-end;

    ${mq.lg} {
      box-sizing: border-box;
      width: 100%;
      max-width: var(--checkout-right-max);
      padding: 0 ${token.paddingXL}px;
    }
  `,
}));
