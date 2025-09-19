import { cmsPick } from "@src/cms/pick";
import useIsInTheCartShopana from "./useIsInTheCart.shopana";
import useIsInTheCartShopify from "./useIsInTheCart.shopify";


export default cmsPick({
  shopana: useIsInTheCartShopana,
  shopify: useIsInTheCartShopify,
});