import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';
import { mq } from '#checkout/ui/breakpoints';

interface CheckoutColumnsProps {
  /** The form: brand, sections and, on desktop, the actions. */
  left: ReactNode;
  /** The order summary and, on a phone, the actions under it. */
  right: ReactNode;
}

/**
 * Columns of the checkout page: the form on the left, the summary on a grey background on the
 * right, sticky on desktop. On a phone the summary goes under the form.
 */
export const CheckoutColumns = ({ left, right }: CheckoutColumnsProps) => {
  const { styles } = useStyles();
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Flex className={styles.left}>{left}</Flex>
        <Flex className={styles.rightContainer}>
          <Flex vertical gap={12} className={styles.right}>
            {right}
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => ({
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
    border-right: 2px solid ${token.colorBorder};
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
}));
