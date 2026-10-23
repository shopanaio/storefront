'use client';

import { Flex } from 'antd';
import { createStyles } from 'antd-style';
import type { ReactNode } from 'react';

/** Full-width centered layout shared by the result, waiting and return screens. */
export const PlacementScreen = ({
  brand,
  children,
}: {
  brand?: ReactNode;
  children: ReactNode;
}) => {
  const { styles } = useStyles();
  return (
    <Flex vertical align="center" className={styles.screen}>
      {brand}
      <div className={styles.content}>{children}</div>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  screen: css`
    width: 100%;
    min-height: 60vh;
    padding: ${token.paddingXL}px ${token.padding}px;
    gap: ${token.marginLG}px;
  `,
  content: css`
    width: 100%;
    max-width: 560px;
  `,
}));
