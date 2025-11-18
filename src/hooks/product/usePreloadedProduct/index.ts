import { cmsPick } from "@src/cms/pick";
import usePreloadedProductShopana from "./usePreloadedProduct.shopana";
import usePreloadedProductShopify from "./usePreloadedProduct.shopify";
export type { UsePreloadedProductResult } from "./types";

export default cmsPick({
  shopana: usePreloadedProductShopana,
  shopify: usePreloadedProductShopify,
});
