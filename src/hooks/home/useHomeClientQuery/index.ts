import { cmsPick } from "@src/cms/pick";
import useHomeClientQueryShopana from "./useHomeClientQuery.shopana";
import useHomeClientQueryShopify from "./useHomeClientQuery.shopify";

export default cmsPick({
  shopana: useHomeClientQueryShopana,
  shopify: useHomeClientQueryShopify,
});
