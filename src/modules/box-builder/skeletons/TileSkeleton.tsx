'use client';

import { Flex, Image, Skeleton } from 'antd';
import { createStyles } from 'antd-style';

export const BoxBuilderTileSkeleton: React.FC = () => {
  const { styles } = useStyles();

  return (
    <Flex vertical className={styles.container} gap={8}>
      <Skeleton.Image
        className={styles.cover}
        style={{ width: '100%', height: '100%' }}
      />
      <Flex vertical gap={4}>
        <Skeleton.Button active block style={{ height: 32, borderRadius: 6 }} />
        <Skeleton.Node active style={{ height: 14, width: '60%' }} />
        <Skeleton.Node active style={{ height: 14, width: '90%' }} />
        <Skeleton.Node active style={{ height: 14, width: '40%' }} />
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
  cover: css`
    width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-top-left-radius: ${token.borderRadius}px;
    border-top-right-radius: ${token.borderRadius}px;
  `,
}));
