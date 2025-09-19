import { cmsPick } from "@src/cms/pick";
import loadCategoryServerQueryShopana from "./loadCategoryServerQuery.shopana";
import loadCategoryServerQueryShopify from "./loadCategoryServerQuery.shopify";

export default cmsPick({
  shopana: loadCategoryServerQueryShopana,
  shopify: loadCategoryServerQueryShopify,
});