import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useCreateCartShopana from "./useCreateCart.shopana";
import useCreateCartShopify from "./useCreateCart.shopify";

export default cmsPick({
  shopana: useCreateCartShopana,
  shopify: useCreateCartShopify,
});
