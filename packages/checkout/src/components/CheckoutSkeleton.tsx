'use client';

import { mq } from '@shopana/storefront-ui';
import { Flex, Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import type React from 'react';

const { Text } = Typography;

export interface CheckoutSkeletonProps {
  /** Over the form: the bar of the store's brand. */
  header?: React.ReactNode;
}

/**
 * Skeleton of the checkout page that mirrors its two columns, in the page's flow: the page
 * shows it while the checkout loads, and the checkout over its form while its data loads.
 */
export const CheckoutSkeleton: React.FC<CheckoutSkeletonProps> = ({
  header,
}) => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <Flex className={styles.left} vertical>
          {header}
          <Flex vertical gap={16}>
            <Text className={styles.sectionTitle} strong>
              <Skeleton.Input size="small" style={{ width: 150 }} />
            </Text>
            <Skeleton paragraph={{ rows: 3 }} title={false} />
            <Skeleton paragraph={{ rows: 3 }} title={false} />
          </Flex>
        </Flex>

        <Flex className={styles.rightContainer}>
          <Flex vertical gap={12} className={styles.right}>
            <Skeleton paragraph={{ rows: 5 }} />
            <Flex vertical gap={12} className={styles.actionsRight}>
              <Skeleton.Button size="large" style={{ width: 220 }} />
              <Skeleton.Input size="small" style={{ width: 180 }} />
            </Flex>
            <Skeleton paragraph={{ rows: 3 }} title={false} />
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      background-color: ${token.colorBgContainer};
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
        grid-template-columns:
          minmax(0, var(--checkout-left-fr))
          minmax(0, var(--checkout-right-fr));
      }
    `,
    left: css`
      box-sizing: border-box;
      width: 100%;
      flex-direction: column;
      gap: ${token.marginMD}px;
      border-right: 2px solid ${token.colorBorder};
      padding: ${token.padding}px;

      ${mq.lg} {
        margin-left: auto;
        max-width: var(--checkout-left-max);
        padding: ${token.paddingXL}px;
      }
    `,
    rightContainer: css`
      display: none;
      ${mq.lg} {
        display: block;
      }
      background-color: ${token.colorBgLayout};
    `,
    right: css`
      box-sizing: border-box;
      width: 100%;
      padding: ${token.padding}px;

      ${mq.lg} {
        max-width: var(--checkout-right-max);
        position: sticky;
        padding: ${token.paddingXL}px;
        min-height: 100vh;
        top: 0;
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
    sectionTitle: css`
      font-size: ${token.fontSizeXL}px;
    `,
    divider: css`
      margin: 0;
    `,
  };
});
