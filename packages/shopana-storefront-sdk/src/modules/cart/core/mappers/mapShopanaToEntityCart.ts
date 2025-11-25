import type { model } from '../../../../model/namespace';

/**
 * Maps Shopana checkout response to Entity Cart model
 * Since we're Shopana-only, this is a simple type cast
 */
export function mapShopanaCheckoutToEntityCart(checkout: any): model.Cart {
  return checkout as model.Cart;
}
