import { cmsPick } from "@src/cms/pick";
import useAddItemToCartShopana from "./useAddItemToCart.shopana";
import useAddItemToCartShopify from "./useAddItemToCart.shopify";

export default cmsPick({
  shopana: useAddItemToCartShopana,
  shopify: useAddItemToCartShopify,
});
