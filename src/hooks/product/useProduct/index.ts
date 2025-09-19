import { cmsPick } from "@src/cms/pick";
import useProductShopana from "./useProduct.shopana";
import useProductShopify from "./useProduct.shopify";

export default cmsPick({
  shopana: useProductShopana,
  shopify: useProductShopify,
});
