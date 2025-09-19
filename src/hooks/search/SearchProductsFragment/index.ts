import { cmsPick } from "@src/cms/pick";
import SearchProductsFragmentShopana from "./SearchProductsFragment.shopana";
import SearchProductsFragmentShopify from "./SearchProductsFragment.shopify";

export default cmsPick({
  shopana: SearchProductsFragmentShopana,
  shopify: SearchProductsFragmentShopify,
});
