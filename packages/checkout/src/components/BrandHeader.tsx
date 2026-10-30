'use client';

import { Button } from 'antd';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { TbShoppingCart } from 'react-icons/tb';
import { useCheckoutTheme } from '#checkout/theme';
import { useBreakpointDown } from '@shopana/storefront-ui';
import { BrandBar } from './BrandBar';

/**
 * The brand of the store over the form. On a phone the cart of the store stands on the right
 * of the bar, as the summary title under it no longer carries the cart there. On desktop the
 * cart stays at the order summary.
 */
export const BrandHeader = ({ children }: { children?: ReactNode }) => {
  const t = useTranslations('Checkout');
  const { useOpenCart } = useCheckoutTheme();
  const openCart = useOpenCart();
  const mobile = useBreakpointDown('lg');
  const cart = mobile && openCart;
  return (
    <BrandBar
      action={
        cart ? (
          <Button
            color="default"
            variant="text"
            aria-label={t('open-cart')}
            icon={<TbShoppingCart size={22} />}
            onClick={cart}
          />
        ) : null
      }
    >
      {children}
    </BrandBar>
  );
};
