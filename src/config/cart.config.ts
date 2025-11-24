import { createCartConfig } from '@shopana/storefront-sdk/modules/cart/core';
import type { CartConfig } from '@shopana/storefront-sdk/modules/cart/core';

/**
 * Cart module configuration
 * Defines default currency, locale, and cookie settings for cart management
 */
export const cartConfig: CartConfig = createCartConfig({
  defaultCurrency: 'UAH',
  defaultLocale: 'uk',
  cookieName: 'shopana_cart_id',
  cookieOptions: {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
});
