import { createStyles } from 'antd-style';
import { mq } from '#checkout/ui/breakpoints';
import { Summary } from './summary/Summary';
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

  return (
    <div className={styles.wrapper}>
      <form onSubmit={onSubmit}>
        <CheckoutColumns
          left={
            <>
              {brand}
              <CheckoutSection
                id={sectionAnchor(SectionId.Contact)}
                title={t('contact')}
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
                {/* Part of the delivery block: who receives it. */}
                <CheckoutSection id={sectionAnchor(SectionId.Recipient)}>
                  <SectionRenderer slug={SectionId.Recipient} />
                  <SectionIssues sections={[SectionId.Recipient]} />
                </CheckoutSection>
              </CheckoutSection>

              <CheckoutSection
                id={sectionAnchor(SectionId.Payment)}
                title={t('payment')}
              >
                <SectionRenderer slug={SectionId.Payment} />
                <SectionIssues sections={[SectionId.Payment]} />
              </CheckoutSection>

              <CheckoutSection id={sectionAnchor(SectionId.Comment)}>
                <SectionRenderer slug={SectionId.Comment} />
                <SectionIssues sections={[SectionId.Comment]} />
              </CheckoutSection>

              <div className={styles.actionsLeft}>
                <CheckoutActions />
              </div>
            </>
          }
          right={
            <>
              <div id={SUMMARY_ANCHOR} className={styles.summary}>
                {checkout ? <Summary checkout={checkout} /> : null}
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
    actionsLeft: css`
      display: none;
      ${mq.lg} {
        display: flex;
      }
    `,
    actionsRight: css`
      ${mq.lg} {
        display: none;
      }
    `,

    summary: css`
      display: flex;
      flex-direction: column;
      gap: 12px;
    `,

    logInButton: css`
      padding: 0;
    `,
  };
});
