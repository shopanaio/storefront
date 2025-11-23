import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useAddItemToCartShopana from "./useAddItemToCart.shopana";
import useAddItemToCartShopify from "./useAddItemToCart.shopify";

export default cmsPick({
  shopana: useAddItemToCartShopana,
  shopify: useAddItemToCartShopify,
});
