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
import { Money } from '@src/components/UI/Price/Money';

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

  const subtotal = cart?.cost?.totalAmount ? (
    <Money as="span" money={cart.cost.totalAmount} />
  ) : null;

  return (
    <AppDrawerButton
      variant="text"
      color="default"
      icon={<TbShoppingCart size={24} color={token.colorPrimary} />}
      onClick={handleClick}
      topText={t('cart')}
      bottomText={subtotal}
      className={styles.button}
    >
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

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    gap: ${token.marginXS}px;
  `,
  badge: css`
    margin-left: auto;
  `,
}));
