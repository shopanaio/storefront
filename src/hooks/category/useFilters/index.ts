import { cmsPick } from "@src/cms/pick";

import useFiltersShopana from "./useFilters.shopana";
import useFiltersShopify from "./useFilters.shopify";

export type UseFiltersParams = {
  filters: any[];
};

export default cmsPick({
  shopana: useFiltersShopana,
  shopify: useFiltersShopify,
});