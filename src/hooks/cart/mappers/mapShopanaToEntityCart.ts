import type { model } from '@shopana/storefront-sdk';

export function mapShopanaCheckoutToEntityCart(checkout: any): model.Cart {
  return checkout as model.Cart;
}
