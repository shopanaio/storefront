'use client';

import React from 'react';
import { Button } from 'antd';
import { TbShoppingCart } from 'react-icons/tb';
import { Badge } from '@src/components/UI/Badge';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import useToken from 'antd/es/theme/useToken';
import useCart from '@src/hooks/cart/useCart';
import { useModalStore } from '@src/store/appStore';

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

  const totalQuantity = cart?.totalQuantity ?? 0;

  const handleClick = () => {
    setIsCartDrawerOpen(true);
  };

  return (
    <Button
      variant="solid"
      color="primary"
      icon={<TbShoppingCart size={20} />}
      className={styles.cartButton}
      onClick={handleClick}
    >
      {t('cart')}
      {totalQuantity > 0 && (
        <Badge
          styles={{
            indicator: {
              backgroundColor: token.colorBgBase,
              color: token.colorPrimary,
            },
          }}
          color="primary"
          count={totalQuantity}
          className={styles.badge}
        />
      )}
    </Button>
  );
};

const useStyles = createStyles(({ css }) => ({
  cartButton: css`
    height: 46px;
    display: flex;
    justify-content: flex-start;
  `,
  badge: css`
    margin-left: auto;
  `,
}));
