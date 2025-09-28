import { cmsPick } from "@src/cms/pick";
import useClearCartShopana from "./useClearCart.shopana";
import useClearCartShopify from "./useClearCart.shopify";

export type { ClearCartInput, UseClearCartReturn } from "./interface";

export default cmsPick({
  shopana: useClearCartShopana,
  shopify: useClearCartShopify,
});
