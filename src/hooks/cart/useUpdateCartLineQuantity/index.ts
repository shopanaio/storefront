import { cmsPick } from "@src/cms/pick";
import useUpdateCartLineQuantityShopana from "./useUpdateCartLineQuantity.shopana";
import useUpdateCartLineQuantityShopify from "./useUpdateCartLineQuantity.shopify";


export default cmsPick({
  shopana: useUpdateCartLineQuantityShopana,
  shopify: useUpdateCartLineQuantityShopify,
});