import { cmsPick } from "@src/cms/pick";
import useSearchProductsFragmentShopana from "./useSearchProductsFragment.shopana";
import useSearchProductsFragmentShopify from "./useSearchProductsFragment.shopify";

export default cmsPick({
  shopana: useSearchProductsFragmentShopana,
  shopify: useSearchProductsFragmentShopify,
});
