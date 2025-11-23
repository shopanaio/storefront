import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useIsInTheCartShopana from "./useIsInTheCart.shopana";
import useIsInTheCartShopify from "./useIsInTheCart.shopify";


export default cmsPick({
  shopana: useIsInTheCartShopana,
  shopify: useIsInTheCartShopify,
});