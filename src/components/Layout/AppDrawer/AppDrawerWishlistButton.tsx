'use client';

import React from 'react';
import { TbHeart } from 'react-icons/tb';
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
    <AppDrawerButton
      icon={<TbHeart size={24} color={token.colorPrimary} />}
      topText={t('my-items')}
      bottomText={t('wishlist')}
      className={styles.button}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    gap: ${token.marginXS}px;
  `,
}));
