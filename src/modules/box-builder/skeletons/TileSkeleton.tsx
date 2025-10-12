'use client';

import { Flex, Skeleton } from 'antd';
import { createStyles } from 'antd-style';

export const BoxBuilderTileSkeleton: React.FC = () => {
  const { styles } = useStyles();

  return (
    <Flex vertical className={styles.container} gap={8}>
      <div className={styles.thumbnailFrame}>
        <div className={styles.imageWrapper}>
          <Skeleton.Image className={styles.img} />
        </div>
      </div>
      <Flex vertical gap={4}>
        <Skeleton.Button block style={{ height: 32, borderRadius: 6 }} />
        <Skeleton.Node style={{ height: 14, width: '60%' }} />
        <Skeleton.Node style={{ height: 14, width: '90%' }} />
        <Skeleton.Node style={{ height: 14, width: '40%' }} />
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
  thumbnailFrame: css`
    width: 100%;
    aspect-ratio: 1 / 1;
    padding: ${token.paddingXXS}px;
    border-radius: ${token.borderRadius}px;
    box-sizing: border-box;
    border: 1px solid ${token.colorBorder};
  `,
  imageWrapper: css`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: ${token.borderRadius}px;
  `,
  img: css`
    width: 100% !important;
    height: 100% !important;
    display: block;
    border-radius: ${token.borderRadius}px;
  `,
}));
