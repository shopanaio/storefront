import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import { mq } from '@src/components/UI/Theme/breakpoints';
import { Summary } from './summary/Summary';
import { CheckoutActions } from './submit/CheckoutActions';
import { SectionRenderer } from '@src/modules/checkout/infra/SectionRenderer';
import { CheckoutSection } from '@src/modules/checkout/components/common/CheckoutSection';
import { CheckoutAuth } from './CheckoutAuth';
import { CheckoutSkeleton } from './CheckoutSkeleton';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import { SectionId } from '@src/modules/checkout/state/interface';

interface CheckoutViewProps {
  brand?: React.ReactNode;
  features?: {
    auth?: boolean;
    country?: 'UA' | 'INTL';
  };
  validationError: string | null;
  onClearError: () => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
}

/**
 * Checkout view component - handles only rendering
 */
export const CheckoutView = ({
  brand,
  features,
  validationError,
  onClearError,
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
                title={t('contact')}
                headerAction={
                  features?.auth ? (
                    <CheckoutAuth className={styles.logInButton} />
                  ) : undefined
                }
              >
                <SectionRenderer slug={SectionId.Contact} />
              </CheckoutSection>

              <CheckoutSection title={t('delivery')}>
                <SectionRenderer slug={SectionId.Address} />
                <SectionRenderer slug={SectionId.Delivery} />
              </CheckoutSection>

              <CheckoutSection>
                <SectionRenderer slug={SectionId.Recipient} />
              </CheckoutSection>

              <CheckoutSection title={t('payment')}>
                <SectionRenderer slug={SectionId.Payment} />
              </CheckoutSection>

              <CheckoutSection>
                <SectionRenderer slug={SectionId.Comment} />
              </CheckoutSection>

              <div className={styles.actionsLeft}>
                <CheckoutActions
                  validationError={validationError}
                  onClearError={onClearError}
                />
              </div>
            </Flex>
            <Flex className={styles.rightContainer}>
              <Flex vertical gap={12} className={styles.right}>
                {checkout ? <Summary checkout={checkout} /> : null}
                <div className={styles.actionsRight}>
                  <CheckoutActions
                    validationError={validationError}
                    onClearError={onClearError}
                  />
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

    logInButton: css`
      padding: 0;
    `,
  };
});
