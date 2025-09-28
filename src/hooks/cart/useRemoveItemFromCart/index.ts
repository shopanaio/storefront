import { cmsPick } from "@src/cms/pick";
import useRemoveItemFromCartShopana from "./useRemoveItemFromCart.shopana";
import useRemoveItemFromCartShopify from "./useRemoveItemFromCart.shopify";

// Universal interface for removing item from cart
export interface RemoveFromCartInput {
  lineId: string;
}

export default cmsPick({
  shopana: useRemoveItemFromCartShopana,
  shopify: useRemoveItemFromCartShopify,
});
