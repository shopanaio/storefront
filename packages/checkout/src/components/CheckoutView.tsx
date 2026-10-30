import { createStyles } from 'antd-style';
import { mq, useBreakpointDown } from '@shopana/storefront-ui';
import { Summary } from './summary/Summary';
import { SummaryLines } from './summary/SummaryLines';
import { CheckoutActions } from './submit/CheckoutActions';
import { BrandHeader } from './BrandHeader';
import { CheckoutFormSections, CommentSection } from './CheckoutFormSections';
import { CheckoutSignInColumn } from './CheckoutSignInColumn';
import { CheckoutSkeleton } from './CheckoutSkeleton';
import { CheckoutColumns } from './CheckoutColumns';
import type { CheckoutProps } from './Checkout';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useCheckoutSignIn } from '#checkout/context/CheckoutSignInContext';
import { usePreloadModules } from '#checkout/infra/preloadModules';
import { useCheckoutTheme } from '#checkout/theme';
import { SUMMARY_ANCHOR } from '#checkout/ui/focusAnchor';
import { useHeldPending } from '#checkout/ui/LoadingBoundary';

export type CheckoutViewProps = Pick<CheckoutProps, 'brand'> & {
  onSubmit: (e: React.FormEvent) => void;
};

/**
 * Checkout view component - handles only rendering. The form on the left, the summary on the
 * right. While the sign-in is required (`useCheckoutSignIn().required`: A1–A2, S6) it stands
 * in place of the form, and the summary keeps the lines and the totals.
 */
export const CheckoutView = ({ brand, onSubmit }: CheckoutViewProps) => {
  const { checkout } = useCheckoutData();
  usePreloadModules(checkout);
  const { styles } = useStyles();
  const { required: signInRequired } = useCheckoutSignIn();
  const { beforeActions: BeforeActions } = useCheckoutTheme().slots;
  // Below lg the lines of the order lead the page, over the form; the rest of the summary goes
  // under the form, and the order comment with it, over the totals.
  const stacked = useBreakpointDown('lg');
  // An expired account checkout has no data to wait for: the sign-in shows at once (S6). Data
  // already here (a checkout opened again) shows at once too, with no skeleton.
  const loading = useHeldPending(!checkout && !signInRequired);

  return (
    <div className={styles.wrapper}>
      <CheckoutColumns
        left={
          <>
            <BrandHeader>{brand}</BrandHeader>
            {stacked && checkout ? <SummaryLines checkout={checkout} /> : null}
            {signInRequired ? (
              <CheckoutSignInColumn />
            ) : (
              <CheckoutFormSections onSubmit={onSubmit} stacked={stacked} />
            )}
          </>
        }
        right={
          <>
            <div id={SUMMARY_ANCHOR} className={styles.summary}>
              {checkout ? (
                <Summary
                  checkout={checkout}
                  withLines={!stacked}
                  beforeTotals={
                    stacked && !signInRequired ? <CommentSection /> : null
                  }
                  linesAndTotalsOnly={signInRequired}
                />
              ) : null}
            </div>
            {signInRequired ? null : (
              // On a phone the actions stand under the summary, out of the form they submit.
              <div className={styles.actions}>
                {BeforeActions ? <BeforeActions /> : null}
                <CheckoutActions />
              </div>
            )}
          </>
        }
      />
      {loading ? (
        <div className={styles.skeleton}>
          <CheckoutSkeleton header={<BrandHeader>{brand}</BrandHeader>} />
        </div>
      ) : null}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => {
  return {
    wrapper: css`
      position: relative;
      width: 100%;
      /* Text that sets no size of its own takes the checkout's, not the host page's. */
      font-size: ${token.fontSize}px;
      line-height: ${token.lineHeight};
    `,
    // Over the form while the data loads: the form renders under it, laid out by the time it shows.
    skeleton: css`
      position: absolute;
      inset: 0;
      z-index: 10;
      overflow: hidden;
    `,
    actions: css`
      display: contents;
      ${mq.lg} {
        display: none;
      }
    `,

    summary: css`
      display: flex;
      flex-direction: column;
      gap: 12px;
      /* On a phone it stands right in the page, under the form. */
      padding: ${token.padding}px ${token.padding}px 0;

      ${mq.lg} {
        padding: 0;
      }
    `,
  };
});
