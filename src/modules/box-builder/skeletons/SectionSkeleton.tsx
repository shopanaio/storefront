'use client';

import React from 'react';
import { createStyles } from 'antd-style';
import { Flex, Skeleton } from 'antd';
import { BoxBuilderGridSkeleton } from './GridSkeleton';

export const BoxBuilderSectionSkeleton: React.FC<{
  titleRows?: number;
  items?: number;
}> = ({ titleRows = 1, items = 8 }) => {
  const { styles } = useStyles();

  return (
    <Flex vertical className={styles.container} gap={16}>
      <div className={styles.header}>
        {Array.from({ length: titleRows }).map((_, idx) => (
          <Skeleton.Input
            key={idx}
            block
            active={false}
            size="small"
            style={{
              height: 22,
              borderRadius: 6,
              width: idx === 0 ? '55%' : '35%',
            }}
          />
        ))}
      </div>
      <BoxBuilderGridSkeleton count={items} />
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding: 0;
  `,
  header: css`
    display: grid;
    gap: ${token.paddingXS}px;
    margin-left: ${token.margin}px;
  `,
}));
