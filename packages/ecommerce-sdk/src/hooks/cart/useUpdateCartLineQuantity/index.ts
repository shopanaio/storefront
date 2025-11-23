import { cmsPick } from "@ecommerce-sdk/utils/cmsPick";
import useUpdateCartLineQuantityShopana from "./useUpdateCartLineQuantity.shopana";
import useUpdateCartLineQuantityShopify from "./useUpdateCartLineQuantity.shopify";


export default cmsPick({
  shopana: useUpdateCartLineQuantityShopana,
  shopify: useUpdateCartLineQuantityShopify,
});