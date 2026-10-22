import { createStyles } from 'antd-style';
import { breakpoints, mq } from '#checkout/ui/breakpoints';
import { useMediaQuery } from '#checkout/ui/useMediaQuery';
import { Summary } from './summary/Summary';
import { SummaryLines } from './summary/SummaryLines';
import { CheckoutActions } from './submit/CheckoutActions';
import { SectionRenderer } from '#checkout/infra/SectionRenderer';
import { CheckoutSection } from '#checkout/components/common/CheckoutSection';
import { CheckoutAuth } from './CheckoutAuth';
import { CheckoutSkeleton } from './CheckoutSkeleton';
import { CheckoutColumns } from './CheckoutColumns';
import { SectionIssues } from './notices/SectionIssues';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { usePreloadModules } from '#checkout/infra/preloadModules';
import { SectionId } from '#checkout/state/interface';
import { bannerToneDeclarations } from '#checkout/ui/banner/tones';
import { sectionAnchor, SUMMARY_ANCHOR } from '#checkout/ui/focusAnchor';

interface CheckoutViewProps {
  brand?: React.ReactNode;
  features?: {
    auth?: boolean;
    country?: 'UA' | 'INTL';
  };
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

/**
 * Checkout view component - handles only rendering
 */
export const CheckoutView = ({
  brand,
  features,
  onSubmit,
  t,
}: CheckoutViewProps) => {
  const { checkout } = useCheckoutData();
  usePreloadModules(checkout);
  const { styles } = useStyles();
  // Below lg the lines of the order lead the page, over the form; the rest of the summary goes
  // under the form, and the order comment with it, over the totals.
  const stacked = useMediaQuery(`(max-width: ${breakpoints.lg - 0.05}px)`);
  const comment = (
    <CheckoutSection id={sectionAnchor(SectionId.Comment)}>
      <SectionRenderer slug={SectionId.Comment} />
      <SectionIssues sections={[SectionId.Comment]} />
    </CheckoutSection>
  );

  return (
    <div className={styles.wrapper}>
      <form onSubmit={onSubmit}>
        <CheckoutColumns
          left={
            <>
              {brand}
              {stacked && checkout ? <SummaryLines checkout={checkout} /> : null}
              <CheckoutSection
                id={sectionAnchor(SectionId.Contact)}
                title={t('contact')}
                // "Log in" is taller than the title and already leaves room under it.
                titleGap={6}
                headerAction={
                  features?.auth ? (
                    <CheckoutAuth className={styles.logInButton} />
                  ) : undefined
                }
              >
                <SectionRenderer slug={SectionId.Contact} />
                <SectionIssues sections={[SectionId.Contact]} />
              </CheckoutSection>

              <CheckoutSection
                id={sectionAnchor(SectionId.Delivery)}
                title={t('delivery')}
              >
                <SectionRenderer slug={SectionId.Address} />
                <SectionRenderer slug={SectionId.Delivery} />
                <SectionIssues sections={[SectionId.Address, SectionId.Delivery]} />
                {/* Part of the delivery block: who receives it, a little apart from the methods. */}
                <div className={styles.recipient}>
                  <CheckoutSection id={sectionAnchor(SectionId.Recipient)}>
                    <SectionRenderer slug={SectionId.Recipient} />
                    <SectionIssues sections={[SectionId.Recipient]} />
                  </CheckoutSection>
                </div>
              </CheckoutSection>

              <CheckoutSection
                id={sectionAnchor(SectionId.Payment)}
                title={t('payment')}
              >
                <SectionRenderer slug={SectionId.Payment} />
                <SectionIssues sections={[SectionId.Payment]} />
              </CheckoutSection>

              {stacked ? null : comment}

              <div className={styles.actionsLeft}>
                <CheckoutActions />
              </div>
            </>
          }
          right={
            <>
              <div id={SUMMARY_ANCHOR} className={styles.summary}>
                {checkout ? (
                  <Summary
                    checkout={checkout}
                    withLines={!stacked}
                    beforeTotals={stacked ? comment : null}
                  />
                ) : null}
              </div>
              <div className={styles.actionsRight}>
                <CheckoutActions />
              </div>
            </>
          }
        />
      </form>
      <CheckoutSkeleton brand={brand} isReady={!!checkout} />
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
      ${bannerToneDeclarations()}
    `,
    // On desktop the actions sit right in the form column, so their panel can be sticky in it.
    actionsLeft: css`
      display: none;
      ${mq.lg} {
        display: contents;
      }
    `,
    actionsRight: css`
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

    recipient: css`
      margin-top: ${token.marginXS}px;
    `,

    logInButton: css`
      padding: 0;
    `,
  };
});
