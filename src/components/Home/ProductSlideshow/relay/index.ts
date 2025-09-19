import { cmsPick } from "@src/cms/pick";
import useProductSlideShowShopanaFragment from "./useProductSlideshowFragment.shopana";
import useProductSlideShowShopifyFragment from "./useProductSlideshowFragment.shopify";

export default cmsPick({
  shopana: useProductSlideShowShopanaFragment,
  shopify: useProductSlideShowShopifyFragment,
});
