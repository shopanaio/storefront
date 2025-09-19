import { cmsPick } from "@src/cms/pick";
import CartProviderShopana from "./cart-provider.shopana";
import CartProviderShopify from "./cart-provider.shopify";

export default cmsPick({
  shopana: CartProviderShopana,
  shopify: CartProviderShopify,
});