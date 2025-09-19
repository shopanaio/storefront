import { cmsPick } from "@src/cms/pick";
import usePredictiveSearchShopana from "./usePredictiveSearch.shopana";
import usePredictiveSearchShopify from "./usePredictiveSearch.shopify";

export default cmsPick({
  shopana: usePredictiveSearchShopana,
  shopify: usePredictiveSearchShopify,
});
