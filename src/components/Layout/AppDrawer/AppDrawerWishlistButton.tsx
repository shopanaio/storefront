'use client';

import React from 'react';
import { Button } from 'antd';
import { TbHeart } from 'react-icons/tb';
import { Badge } from '@src/components/UI/Badge';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import useToken from 'antd/es/theme/useToken';

/**
 * Wishlist button for the app drawer
 */
export const AppDrawerWishlistButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const { styles } = useStyles();

  return (
    <Button
      variant="text"
      color="default"
      icon={<TbHeart size={20} color={token.colorPrimary} />}
      className={styles.linkButton}
    >
      {t('wishlist')}
      <Badge count={100} variant="primary" className={styles.badge} />
    </Button>
  );
};

const useStyles = createStyles(({ css }) => ({
  linkButton: css`
    height: 46px;
    display: flex;
    justify-content: flex-start;
  `,
  badge: css`
    margin-left: auto;
  `,
}));
