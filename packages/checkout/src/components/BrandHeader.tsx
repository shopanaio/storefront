'use client';

import { Button, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { TbShoppingCart } from 'react-icons/tb';
import { useCheckoutTheme } from '#checkout/theme';
import { mq, useBreakpointDown } from '@shopana/storefront-ui';

/**
 * The brand of the store over the form. On a phone it is a white bar from edge to edge over the
 * grey page, the logo on the left and the cart of the store on the right, as the summary title
 * under it no longer carries the cart there. On desktop the form side is white already, so the
 * brand stands as it is and the cart stays at the order summary.
 */
export const BrandHeader = ({ children }: { children?: ReactNode }) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { useOpenCart } = useCheckoutTheme();
  const openCart = useOpenCart();
  const mobile = useBreakpointDown('lg');
  const cart = mobile && openCart;
  if (!children && !cart) return null;
  return (
    <Flex
      align="center"
      justify="space-between"
      gap={8}
      className={styles.header}
    >
      <div className={styles.brand}>{children}</div>
      {cart ? (
        <Button
          color="default"
          variant="text"
          aria-label={t('open-cart')}
          icon={<TbShoppingCart size={22} />}
          onClick={cart}
        />
      ) : null}
    </Flex>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  // The negative margins take back the padding of the form column, so the bar meets the edges.
  // The shadow lifts the bar over the grey page; it stays over the content under it.
  header: css`
    position: relative;
    z-index: 1;
    height: 64px;
    margin: -${token.padding}px -${token.padding}px 0;
    padding: 0 ${token.padding}px;
    background-color: ${token.colorBgContainer};
    box-shadow: ${token.boxShadowTertiary};

    ${mq.lg} {
      position: static;
      height: auto;
      margin: 0;
      padding: 0;
      background-color: transparent;
      box-shadow: none;
    }
  `,
  // As wide as the logo on a phone, so it stands on the left; the whole row on desktop, where
  // the theme centers it.
  brand: css`
    min-width: 0;

    ${mq.lg} {
      flex: 1;
    }
  `,
}));
