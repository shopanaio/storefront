import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useClearCartShopana from "./useClearCart.shopana";
import useClearCartShopify from "./useClearCart.shopify";

export type { ClearCartInput, UseClearCartReturn } from "./interface";

export default cmsPick({
  shopana: useClearCartShopana,
  shopify: useClearCartShopify,
});
