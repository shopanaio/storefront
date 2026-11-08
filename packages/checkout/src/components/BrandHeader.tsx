'use client';

import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { TbShoppingCart } from 'react-icons/tb';
import { useCheckoutTheme } from '#checkout/theme';
import { BrandBar } from './BrandBar';

/** The brand of the store over the page, the cart of the store on the right of the bar. */
export const BrandHeader = ({ children }: { children?: ReactNode }) => {
  const t = useTranslations('Checkout');
  const { useOpenCart } = useCheckoutTheme();
  const openCart = useOpenCart();
  return (
    <BrandBar
      action={
        openCart ? (
          <Button
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
