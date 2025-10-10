'use client';

import React from 'react';
import { TbShoppingCart } from 'react-icons/tb';
import { Badge } from '@src/components/UI/Badge';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import useToken from 'antd/es/theme/useToken';
import useCart from '@src/hooks/cart/useCart';
import { useModalStore } from '@src/store/appStore';
import { AppDrawerButton } from './AppDrawerButton';

/**
 * Cart button for the app drawer
 */
export const AppDrawerCartButton: React.FC = () => {
  const t = useTranslations('Header');
  const { styles } = useStyles();
  const [, token] = useToken();
  const { cart } = useCart();
  const setIsCartDrawerOpen = useModalStore(
    (state) => state.setIsCartDrawerOpen
  );
  const setIsAppDrawerOpen = useModalStore((state) => state.setIsAppDrawerOpen);

  const totalQuantity = cart?.totalQuantity ?? 0;

  const handleClick = () => {
    setIsAppDrawerOpen(false);
    setIsCartDrawerOpen(true);
  };

  return (
    <AppDrawerButton
      variant="text"
      color="default"
      icon={<TbShoppingCart size={20} color={token.colorPrimary}/>}
      onClick={handleClick}
    >
      {t('cart')}
      {totalQuantity > 0 && (
        <Badge
          variant="primary"
          count={totalQuantity}
          className={styles.badge}
        />
      )}
    </AppDrawerButton>
  );
};

const useStyles = createStyles(({ css }) => ({
  badge: css`
    margin-left: auto;
  `,
}));
