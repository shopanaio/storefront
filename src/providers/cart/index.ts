import { cmsPick } from "@src/cms/pick";
import CartProviderShopana from "./cart-provider.shopana";
import CartProviderShopify from "./cart-provider.shopify";

const CartProvider = cmsPick({
  shopana: CartProviderShopana,
  shopify: CartProviderShopify,
});

export default CartProvider;
