'use client';

import { Divider, Flex, Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { mq } from '@src/components/UI/Theme/breakpoints';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

/**
 * Skeleton for the Checkout page that mirrors the two-column layout.
 * Manages its own visibility logic: shows for at least 1 second, then hides when isReady.
 */
export interface CheckoutSkeletonProps {
  /** Optional brand component to be displayed in the left column */
  brand?: React.ReactNode;
  /** When true, indicates that the data (e.g., cart) is loaded and ready */
  isReady?: boolean;
}

export const CheckoutSkeleton: React.FC<CheckoutSkeletonProps> = ({
  brand,
  isReady = false,
}) => {
  const { styles } = useStyles();
  const [minDelayPassed, setMinDelayPassed] = useState(false);

  // Ensure skeleton shows for at least 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDelayPassed(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const shouldShow = !isReady || !minDelayPassed;

  if (!shouldShow) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
      <div className={styles.main}>
        <Flex className={styles.left} vertical>
          {brand}
          <Flex vertical gap={16}>
            <Text className={styles.sectionTitle} strong>
              <Skeleton.Input active size="small" style={{ width: 150 }} />
            </Text>
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
            <Skeleton active paragraph={{ rows: 3 }} title={false} />
          </Flex>
        </Flex>

        <Flex className={styles.rightContainer}>
          <Flex vertical gap={12} className={styles.right}>
            <Skeleton active paragraph={{ rows:5 }} />
            <Flex vertical gap={12} className={styles.actionsRight}>
              <Skeleton.Button active size="large" style={{ width: 220 }} />
              <Skeleton.Input active size="small" style={{ width: 180 }} />
            </Flex>
            <Skeleton active paragraph={{ rows: 3 }} title={false} />

          </Flex>
        </Flex>
      </div>
    </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    overlay: css`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
      background-color: ${token.colorBgContainer};
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
      gap: ${token.marginMD}px;
      border-right: 2px solid ${token.colorBorderSecondary};
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
