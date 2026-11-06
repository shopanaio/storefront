'use client';

import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { TbShoppingCart } from 'react-icons/tb';
import { useCheckoutTheme } from '#checkout/theme';
import { mq } from '@shopana/storefront-ui';
import { BrandBar } from './BrandBar';

/**
 * The brand of the store over the form. On a phone the cart of the store stands on the right
 * of the bar, as the summary title under it no longer carries the cart there. On desktop the
 * cart stays at the order summary: the button is in the HTML for every width and hidden from
 * `lg` by its styles.
 */
export const BrandHeader = ({ children }: { children?: ReactNode }) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { useOpenCart } = useCheckoutTheme();
  const openCart = useOpenCart();
  return (
    <BrandBar
      action={
        openCart ? (
          <Button
            className={styles.cart}
            color="default"
            variant="text"
            aria-label={t('open-cart')}
            icon={<TbShoppingCart size={22} />}
            onClick={openCart}
          />
        ) : null
      }
    >
      {children}
    </BrandBar>
  );
};

const useStyles = createStyles(({ css }) => ({
  cart: css`
    ${mq.lg} {
      && {
        display: none;
      }
    }
  `,
}));
