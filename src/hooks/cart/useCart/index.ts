import { cmsPick } from "@src/cms/pick";
import useCartShopana from "./useCart.shopana";
import useCartShopify from "./useCart.shopify";
import type { Entity } from "@shopana/entity";

type UseCart = () => {
  cart: Entity.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
};

export default cmsPick({
  shopana: useCartShopana,
  shopify: useCartShopify,
}) as UseCart;
