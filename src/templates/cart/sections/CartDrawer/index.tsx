'use client';

import React from 'react';
import { Empty, Flex, Typography } from 'antd';
import { Badge } from '@src/ui-kit/Badge';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useRoutes } from '@src/hooks/useRoutes';

import useCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useCart';

import { CartTable } from '@src/templates/cart/blocks/CartTable';
import { useModalStore } from '@src/store/appStore';
import { DrawerBase } from '@src/ui-kit/DrawerBase/DrawerBase';
import { StickyButton } from '@src/ui-kit/StickyButton';
import { EmptyCart } from '@src/templates/cart/atoms/EmptyCartIcon';

export const CartDrawer: React.FC = () => {
  const { styles } = useStyles();
  const t = useTranslations('Cart');

  const routes = useRoutes();
  const { cart } = useCart();
  const isOpen = useModalStore((state) => state.isCartDrawerOpen);
  const setIsOpen = useModalStore((state) => state.setIsCartDrawerOpen);

  const cartLines = cart?.lines ?? [];
  const subtotal = cart?.cost?.subtotalAmount;

  /**
   * Footer with checkout button
   */
  const renderFooter = () =>
    subtotal && (
      <StickyButton
        href={routes.checkout.path()}
        label={t('checkout')}
        money={subtotal as any}
        className={styles.checkoutButton}
      />
    );

  return (
    <DrawerBase
      open={isOpen}
      onClose={() => setIsOpen(false)}
      title={
        <>
          {t('cart')}
          {!!cart?.totalQuantity && (
            <Badge
              count={cart.totalQuantity}
              variant="primary"
              showZero={false}
              offset={[4, -4]}
            />
          )}
        </>
      }
      footer={renderFooter()}
      contentClassName={styles.drawerContent}
    >
      {cartLines.length === 0 ? (
        <Flex
          justify="center"
          align="center"
          style={{
            width: '100%',
            height: '400px',
          }}
        >
          <Empty
            image={<EmptyCart />}
            styles={{
              image: {
                height: 150,
              },
            }}
            description={
              <Flex
                gap={8}
                vertical
                align="center"
                style={{ textAlign: 'center' }}
              >
                <Typography.Text
                  type="secondary"
                  strong
                  style={{ fontSize: 16 }}
                >
                  {t('emptyCart')}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {t('emptyCartDescription')}
                </Typography.Text>
              </Flex>
            }
          />
        </Flex>
      ) : (
        <CartTable
          cartLines={cartLines}
          variant="drawer"
          className={styles.cartTable}
          divider={false}
        />
      )}
    </DrawerBase>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  viewCartBtn: css`
    padding: 0;
  `,
  drawerContent: css`
    padding: 0 !important;
  `,
  cartTable: css`
    gap: ${token.marginXS}px;
  `,
  checkoutButton: css`
    height: 48px;
  `,
}));
