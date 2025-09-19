import { cmsPick } from "@src/cms/pick";
import useCartShopana from "./useCart.shopana";
import useCartShopify from "./useCart.shopify";

export default cmsPick({
  shopana: useCartShopana,
  shopify: useCartShopify,
});
