'use client';

import { createStyles } from 'antd-style';
import { SubmitButton } from './SubmitButton';
import { TermsNotice } from '../notices/TermsNotice';
import { BannerSlot } from '#checkout/components/banner/BannerSlot';
import { mq } from '#checkout/ui/breakpoints';

/**
 * Submit button with the checkout banner above it and the terms under it. The banner and the
 * button are sticky (CSS `position: sticky`): they stay at the bottom of the screen while the
 * buyer scrolls, and land in their place over the terms at the end. The wrappers give way
 * (`display: contents`), so the panel sticks within the whole page on a phone and within the
 * form column on desktop.
 */
export const CheckoutActions = () => {
  const { styles } = useStyles();
  return (
    <div className={styles.actions}>
      <div className={styles.dock}>
        <BannerSlot />
        <SubmitButton />
      </div>
      <div className={styles.terms}>
        <TermsNotice />
      </div>
    </div>
  );
};

/** Room under the stuck panel, over the edge of the screen and the home indicator. */
const BOTTOM = 'calc(20px + env(safe-area-inset-bottom))';

const useStyles = createStyles(({ css, token }) => {
  /*
   * The backing of the panel, without a frame and with a straight top edge; a shadow of the
   * same color fills the room under it. The room is not part of the panel, so where it lands
   * the terms follow the button closely.
   */
  const backing = (color: string) => `
    background: ${color};
    box-shadow: 0 ${BOTTOM} 0 ${color};
  `;
  return {
    actions: css`
      display: contents;
    `,
    // On a phone across the screen on the grey of the page; on desktop in the white form column.
    dock: css`
      position: sticky;
      bottom: ${BOTTOM};
      /* Under the loading skeleton (10). */
      z-index: 9;
      display: flex;
      flex-direction: column;
      gap: 12px;
      /*
       * The room over the button is for when it is stuck; where it lands, the space before it
       * is the one around it: 12px under the totals, the gap of the form column on desktop.
       */
      padding: 12px ${token.padding}px 0;
      ${backing(token.colorBgLayout)}

      ${mq.lg} {
        margin-top: -12px;
        padding: 12px 0 0;
        ${backing(token.colorBgContainer)}
      }
    `,
    // Over the shadow of the panel where it lands.
    terms: css`
      position: relative;
      z-index: 9;
      padding: 12px ${token.padding}px ${token.padding}px;

      ${mq.lg} {
        /* The form column puts its own gap between them. */
        margin-top: -12px;
        padding: 0;
      }
    `,
  };
});
