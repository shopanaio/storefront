import React from "react";
import { Flex, Skeleton } from "antd";
import { SearchProductSkeleton } from "./SearchProductSkeleton";
import { createStyles } from "antd-style";

export const SearchResultsSkeleton: React.FC = () => {
  const { styles } = useStyles();

  return (
    <Flex className={styles.container} vertical>
      <Skeleton.Node style={{ width: 100, height: 20 }} active />
      <Flex className={styles.controls}>
        <Skeleton.Button active size="small" style={{ width: 83 }} />
        <Skeleton.Button active size="small" style={{ width: 83 }} />
        <Skeleton.Button active size="small" style={{ width: 83 }} />
      </Flex>
      <Flex className={styles.content} vertical>
        {[...Array(3)].map((_, idx) => (
          <SearchProductSkeleton key={idx} />
        ))}
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      gap: ${token.marginXS}px;
      padding: ${token.paddingXXS}px;
    `,
    controls: css`
      display: flex;
      gap: ${token.marginXS}px;
      margin-bottom: ${token.marginXS}px;
    `,
    content: css`
      gap: ${token.margin}px;
    `,
  };
});
