import { cmsPick } from '@src/cms/pick';
import useCartShopana from './useCart.shopana';
import useCartShopify from './useCart.shopify';
import type { model } from '@shopana/storefront-sdk';

type UseCart = () => {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
};

const useCartFragment = cmsPick({
  shopana: useCartShopana,
  shopify: useCartShopify,
}) as UseCart;

export default useCartFragment;
