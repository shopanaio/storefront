import type { Entity } from '@shopana/entity';

export function mapShopanaCheckoutToEntityCart(checkout: any): Entity.Cart {
  return checkout as Entity.Cart;
}
