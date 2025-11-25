import { cmsPick } from "@src/cms/pick";
import useProductSlideShowShopifyFragment from "./useProductSlideshowFragment.shopify";

const deprecatedShopanaFragment = () => {
  throw new Error(
    "Shopana home page fragment has moved to the storefront SDK module."
  );
};

export default cmsPick({
  shopana: deprecatedShopanaFragment,
  shopify: useProductSlideShowShopifyFragment,
});
