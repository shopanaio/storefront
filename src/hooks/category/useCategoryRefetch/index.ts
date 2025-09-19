import { cmsPick } from "@src/cms/pick";
import useCategoryRefetchShopana from "./useCategoryRefetch.shopana";
import useCategoryRefetchShopify from "./useCategoryRefetch.shopify";

const useCategoryRefetch = cmsPick({
  shopana: useCategoryRefetchShopana,
  shopify: useCategoryRefetchShopify,
});

export default useCategoryRefetch;