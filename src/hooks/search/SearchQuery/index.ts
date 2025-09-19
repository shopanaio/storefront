import { cmsPick } from "@src/cms/pick";
import SearchQueryShopana from "./SearchQuery.shopana";
import SearchQueryShopify from "./SearchQuery.shopify";

export default cmsPick({
  shopana: SearchQueryShopana,
  shopify: SearchQueryShopify,
});
