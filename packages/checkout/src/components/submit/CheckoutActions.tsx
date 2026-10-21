'use client';

import { useEffect, useRef, useState } from 'react';
import { createStyles } from 'antd-style';
import { SubmitButton } from './SubmitButton';
import { TermsNotice } from '../notices/TermsNotice';
import { BannerSlot } from '#checkout/components/banner/BannerSlot';
import { mq } from '#checkout/ui/breakpoints';

/**
 * Submit button with the checkout banner above it and the terms under it. On mobile the banner
 * and the button stay in a panel at the bottom of the screen; on desktop they stay in place at
 * the end of the form.
 */
export const CheckoutActions = () => {
  const { styles } = useStyles();
  const dockRef = useRef<HTMLDivElement>(null);
  const [dockHeight, setDockHeight] = useState(0);

  // The page ends with room for the panel, so it never covers the last fields.
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setDockHeight(dock.offsetHeight));
    observer.observe(dock);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.actions}>
      <div ref={dockRef} className={styles.dock}>
        <BannerSlot />
        <SubmitButton />
      </div>
      <TermsNotice />
      <div
        className={styles.spacer}
        style={{ height: dockHeight }}
        aria-hidden="true"
      />
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  actions: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  `,
  dock: css`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    /* Under the loading skeleton (10). */
    z-index: 9;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px ${token.padding}px calc(20px + env(safe-area-inset-bottom));
    background: ${token.colorBgContainer};
    border-top: 1px solid ${token.colorBorder};

    ${mq.lg} {
      position: static;
      padding: 0;
      background: none;
      border-top: 0;
    }
  `,
  spacer: css`
    ${mq.lg} {
      display: none;
    }
  `,
}));
