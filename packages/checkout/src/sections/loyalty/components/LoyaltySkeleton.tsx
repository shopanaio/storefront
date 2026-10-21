'use client';

import { Flex, Skeleton } from 'antd';
import { createStyles } from 'antd-style';

/**
 * The loyalty card while the account loads, in the shape of its header: the mark and balance
 * with a small pill on the right, and the line about the next tier under them.
 */
export const LoyaltySkeleton = () => {
  const { styles } = useStyles();
  return (
    <Flex vertical gap={8} className={styles.root}>
      <Flex align="center" justify="space-between" gap={12}>
        <Flex align="center" gap={8}>
          <Skeleton.Avatar active size={20} shape="circle" />
          <Skeleton.Input active size="small" className={styles.balance} />
        </Flex>
        <Skeleton.Button active size="small" shape="round" className={styles.pill} />
      </Flex>
      <Skeleton.Input active size="small" className={styles.note} />
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    padding: ${token.paddingSM}px ${token.padding}px;
  `,
  // Sizes of the texts they stand for; antd gives every placeholder a minimum width otherwise.
  balance: css`
    &.ant-skeleton-element .ant-skeleton-input {
      width: 120px;
      min-width: 0;
      height: 20px;
    }
  `,
  pill: css`
    &.ant-skeleton-element .ant-skeleton-button {
      width: 44px;
      min-width: 0;
      height: 22px;
    }
  `,
  note: css`
    &.ant-skeleton-element .ant-skeleton-input {
      width: 168px;
      min-width: 0;
      height: 12px;
    }
  `,
}));
