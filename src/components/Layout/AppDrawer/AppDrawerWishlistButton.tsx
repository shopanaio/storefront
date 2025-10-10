'use client';

import React from 'react';
import { TbHeart } from 'react-icons/tb';
import { Badge } from '@src/components/UI/Badge';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import useToken from 'antd/es/theme/useToken';
import { AppDrawerButton } from './AppDrawerButton';

/**
 * Wishlist button for the app drawer
 */
export const AppDrawerWishlistButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const { styles } = useStyles();

  return (
    <AppDrawerButton icon={<TbHeart size={20} color={token.colorPrimary} />}>
      {t('wishlist')}
      <Badge count={100} variant="primary" className={styles.badge} />
    </AppDrawerButton>
  );
};

const useStyles = createStyles(({ css }) => ({
  badge: css`
    margin-left: auto;
  `,
}));
