'use client';

import { createStyles } from 'antd-style';
import { TbCoins } from 'react-icons/tb';

/**
 * Mark of the loyalty program: coins, as any store's bonus points, in the theme's secondary color (`colorSecondary`
 * custom token, the error color when the theme has none).
 */
export const LoyaltyIcon = ({ size }: { size: number }) => {
  const { styles } = useStyles();
  return <TbCoins size={size} className={styles.icon} aria-hidden="true" />;
};

const useStyles = createStyles(({ css, token }) => ({
  icon: css`
    flex: none;
    color: ${(token as { colorSecondary?: string }).colorSecondary ?? token.colorError};
  `,
}));
