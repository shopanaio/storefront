import { cmsPick } from "@src/cms/pick";
import CategoryQueryShopana from "./CategoryQuery.shopana";

const NOT_IMPLEMENTED: any = {};

export default cmsPick({
  shopana: CategoryQueryShopana,
  shopify: NOT_IMPLEMENTED,
});

