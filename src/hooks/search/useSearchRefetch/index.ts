import { cmsPick } from "@src/cms/pick";

import useSearchRefetchShopana from "./useSearchRefetch.shopana";
import useSearchRefetchShopify from "./useSearchRefetch.shopify";

export default cmsPick({
  shopana: useSearchRefetchShopana,
  shopify: useSearchRefetchShopify,
});