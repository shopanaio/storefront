'use client';

import React, { useCallback } from 'react';
import { TbHeart } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import useToken from 'antd/es/theme/useToken';
import { AppDrawerButton } from './AppDrawerButton';
import { useWishlistCounts } from '@src/modules/wishlist';
import { useRoutes } from '@src/hooks/useRoutes';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@src/store/appStore';
import { Badge } from '@src/ui-kit/Badge';

/**
 * Wishlist button for the app drawer
 */
export const AppDrawerWishlistButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const { styles } = useStyles();
  const { totalItems } = useWishlistCounts();
  const router = useRouter();
  const routes = useRoutes();
  const setIsAppDrawerOpen = useModalStore((state) => state.setIsAppDrawerOpen);

  const handleClick = useCallback(() => {
    setIsAppDrawerOpen(false);
    router.push(routes.wishlist.path());
  }, [router, routes, setIsAppDrawerOpen]);

  return (
    <AppDrawerButton
      icon={<TbHeart size={24} color={token.colorPrimary} />}
      topText={t('my-items')}
      bottomText={t('wishlist')}
      className={styles.button}
      onClick={handleClick}
    >
      {totalItems > 0 && (
        <Badge
          variant="primary"
          count={totalItems}
          className={styles.badge}
        />
      )}
    </AppDrawerButton>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    gap: ${token.marginXS}px;
  `,
  badge: css`
    margin-left: auto;
  `,
}));
