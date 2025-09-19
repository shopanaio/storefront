import { cmsPick } from "@src/cms/pick";
import useCreateCartShopana from "./useCreateCart.shopana";
import useCreateCartShopify from "./useCreateCart.shopify";

export default cmsPick({
  shopana: useCreateCartShopana,
  shopify: useCreateCartShopify,
});
