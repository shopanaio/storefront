import { cmsPick } from "@src/cms/pick";
import useProductCardFragmentShopana from "./useListingProductCardFragment.shopana";
import useProductCardFragmentShopify from "./useListingProductCardFragment.shopify";

const useProductCardFragment = cmsPick({
  shopana: useProductCardFragmentShopana,
  shopify: useProductCardFragmentShopify,
});

export default useProductCardFragment;
