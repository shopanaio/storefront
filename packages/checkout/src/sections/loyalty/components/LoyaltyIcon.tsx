'use client';

import { createStyles } from 'antd-style';
import { TbCoins } from 'react-icons/tb';

/** Mark of the loyalty program: coins, as any store's bonus points, in the primary color. */
export const LoyaltyIcon = ({ size }: { size: number }) => {
  const { styles } = useStyles();
  return <TbCoins size={size} className={styles.icon} aria-hidden="true" />;
};

const useStyles = createStyles(({ css, token }) => ({
  icon: css`
    flex: none;
    color: ${token.colorPrimary};
  `,
}));
