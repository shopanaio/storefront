import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { mq } from '#checkout/ui/breakpoints';
import { Summary } from './summary/Summary';
import { CheckoutActions } from './submit/CheckoutActions';
import { SectionRenderer } from '#checkout/infra/SectionRenderer';
import { CheckoutSection } from '#checkout/components/common/CheckoutSection';
import { CheckoutAuth } from './CheckoutAuth';
import { CheckoutSkeleton } from './CheckoutSkeleton';
import { SectionIssues } from './notices/SectionIssues';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
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
  const { styles } = useStyles();

  return (
    <div className={styles.wrapper}>
      <form onSubmit={onSubmit}>
        <div className={styles.container}>
          <div className={styles.main}>
            <Flex className={styles.left}>
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
              </CheckoutSection>

              <CheckoutSection id={sectionAnchor(SectionId.Recipient)}>
                <SectionRenderer slug={SectionId.Recipient} />
                <SectionIssues sections={[SectionId.Recipient]} />
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
            </Flex>
            <Flex className={styles.rightContainer}>
              <Flex vertical gap={12} className={styles.right}>
                <div id={SUMMARY_ANCHOR} className={styles.summary}>
                  {checkout ? <Summary checkout={checkout} /> : null}
                </div>
                <div className={styles.actionsRight}>
                  <CheckoutActions />
                </div>
              </Flex>
            </Flex>
          </div>
        </div>
      </form>
      <CheckoutSkeleton brand={brand} isReady={!!checkout} />
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    wrapper: css`
      position: relative;
      width: 100%;
      ${bannerToneDeclarations()}
    `,
    container: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      /* checkout layout variables */
      --checkout-content-max: 1280px;
      /* make left column slightly wider than right */
      --checkout-left-ratio: 0.56;
      --checkout-right-ratio: calc(1 - var(--checkout-left-ratio));
      --checkout-left-fr: 1.1fr;
      --checkout-right-fr: 0.9fr;
      --checkout-left-max: calc(
        var(--checkout-content-max) * var(--checkout-left-ratio)
      );
      --checkout-right-max: calc(
        var(--checkout-content-max) * var(--checkout-right-ratio)
      );
    `,
    main: css`
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 100dvh;

      ${mq.lg} {
        display: grid;
        grid-template-columns: var(--checkout-left-fr) var(--checkout-right-fr);
      }
    `,
    left: css`
      width: 100%;
      flex-direction: column;
      gap: ${token.margin}px;
      border-right: 2px solid ${token.colorBorderSecondary};
      padding: ${token.padding}px;

      ${mq.lg} {
        margin-left: auto;
        max-width: var(--checkout-left-max);
        padding: ${token.paddingXL}px;
      }
    `,
    rightContainer: css`
      background-color: ${token.colorBgLayout};
    `,
    right: css`
      width: 100%;
      padding: ${token.padding}px;

      ${mq.lg} {
        max-width: var(--checkout-right-max);
        position: sticky;
        padding: ${token.paddingXL}px;
        top: 0;
        align-self: flex-start;
      }
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
