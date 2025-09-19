import { cmsPick } from "@src/cms/pick";

import loadHomeServerQueryShopana from "./loadHomeServerQuery.shopana";
import loadHomeServerQueryShopify from "./loadHomeServerQuery.shopify";

export default cmsPick({
  shopana: loadHomeServerQueryShopana,
  shopify: loadHomeServerQueryShopify,
});
