import { cmsPick } from "@src/cms/pick";
import useCategoryClientQueryShopana from "./useCategoryClientQuery.shopana";
import useCategoryClientQueryShopify from "./useCategoryClientQuery.shopify";

export default cmsPick({
  shopana: useCategoryClientQueryShopana,
  shopify: useCategoryClientQueryShopify,
});