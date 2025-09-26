"use client";

import React from "react";
import { createStyles } from "antd-style";
import { Flex } from "antd";
import { BoxBuilderTileSkeleton } from "./TileSkeleton";

export const BoxBuilderGridSkeleton: React.FC<{ count?: number }> = ({
  count = 8,
}) => {
  const { styles } = useStyles();

  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, idx) => (
        <BoxBuilderTileSkeleton key={idx} />
      ))}
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  grid: css`
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    align-items: stretch;
    gap: ${token.marginSM}px;
  `,
}));
