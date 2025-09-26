"use client";

import React from "react";
import { createStyles } from "antd-style";
import { Flex, Skeleton } from "antd";

export const BoxBuilderSwiperSectionSkeleton: React.FC = () => {
  const { styles } = useStyles();

  return (
    <Flex vertical gap={12} className={styles.container}>
      <Skeleton.Input active size="small" style={{ width: 180, height: 22, borderRadius: 6 }} />
      <div className={styles.row}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className={styles.tile}>
            <Skeleton.Node active style={{ width: "100%", height: "100%" }} />
          </div>
        ))}
      </div>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding: 0 ${token.padding}px;
  `,
  row: css`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 140px;
    gap: ${token.marginSM}px;
    overflow: hidden;
    padding: 1px ${token.padding}px;
  `,
  tile: css`
    width: 140px;
    aspect-ratio: 1 / 1;
    border-radius: ${token.borderRadiusLG}px;
    overflow: hidden;
    background: ${token.colorBgContainer};
  `,
}));
