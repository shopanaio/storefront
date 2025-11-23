import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useReplaceCartItemShopana from "./useReplaceCartItem.shopana";
import useReplaceCartItemShopify from "./useReplaceCartItem.shopify";

export type { ReplaceCartItemInput } from "./interface";

export default cmsPick({
  shopana: useReplaceCartItemShopana,
  shopify: useReplaceCartItemShopify,
});
