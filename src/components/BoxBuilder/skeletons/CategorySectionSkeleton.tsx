"use client";

import React from "react";
import { createStyles } from "antd-style";
import { Flex, Skeleton } from "antd";
import { BoxBuilderGridSkeleton } from "./GridSkeleton";

export const BoxBuilderCategorySectionSkeleton: React.FC<{ items?: number }> = ({
  items = 8,
}) => {
  const { styles } = useStyles();

  return (
    <Flex vertical className={styles.container} gap={16}>
      <div className={styles.header}>
        <Skeleton.Input active style={{ width: 160, height: 24, borderRadius: 6 }} />
      </div>
      <BoxBuilderGridSkeleton count={items} />
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding: 0 ${token.padding}px;
  `,
  header: css`
    display: flex;
  `,
}));
