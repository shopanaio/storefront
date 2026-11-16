'use client';

import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

/**
 * Covers the checkout while `placeOrder` is in flight and while the browser leaves for the
 * payment provider: the buyer can neither press nor scroll anything. The page under it does not
 * scroll for as long as it is shown; the checkout makes itself inert, so keys do not reach it
 * either.
 */
export const PlacingOverlay = ({ redirecting }: { redirecting: boolean }) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();

  useEffect(() => {
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = overflow;
    };
  }, []);

  return (
    <div
      className={styles.overlay}
      role="alert"
      aria-busy
      aria-live="assertive"
    >
      <Spin size="large" />
      <div className={styles.text}>
        {t(redirecting ? 'redirecting-to-payment' : 'placing-order')}
      </div>
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  overlay: css`
    position: fixed;
    inset: 0;
    z-index: ${token.zIndexPopupBase};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${token.marginMD}px;
    padding: ${token.padding}px;
    background: color-mix(in srgb, ${token.colorBgContainer} 75%, transparent);
    overscroll-behavior: contain;
    touch-action: none;
  `,
  text: css`
    font-size: ${token.fontSizeLG}px;
    color: ${token.colorText};
    text-align: center;
  `,
}));
