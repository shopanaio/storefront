"use client";

import { Flex, Skeleton } from "antd";
import { createStyles } from "antd-style";

export const BoxBuilderTileSkeleton: React.FC = () => {
  const { styles } = useStyles();

  return (
    <Flex vertical className={styles.container} gap={8}>
      <div className={styles.cover}>
        <Skeleton.Node active style={{ width: "100%", height: "100%" }} />
      </div>
      <Flex vertical className={styles.info} gap={8}>
        <Skeleton.Button active block style={{ height: 36, borderRadius: 6 }} />

        <div className={styles.titleBlock}>
          <Skeleton.Input active size="small" block style={{ height: 14 }} />
          <Skeleton.Input
            active
            size="small"
            block
            style={{ height: 14, width: "85%" }}
          />
        </div>

        <div className={styles.priceBlock}>
          <div className={styles.compareRow}>
            <Skeleton.Input active size="small" style={{ width: 64, height: 12 }} />
            <Skeleton.Node active style={{ width: 32, height: 16, borderRadius: 999 }} />
          </div>
          <Skeleton.Input active size="small" style={{ width: 72, height: 16 }} />
        </div>
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
  info: css`
    width: 100%;
    padding: 0 0 ${token.paddingXS}px;
  `,
  titleBlock: css`
    display: grid;
    gap: ${token.paddingXXS}px;
  `,
  priceBlock: css`
    display: grid;
    gap: ${token.paddingXXS}px;
  `,
  compareRow: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
}));
