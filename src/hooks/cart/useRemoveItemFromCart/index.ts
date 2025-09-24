import { cmsPick } from "@src/cms/pick";
import useRemoveItemFromCartShopana from "./useRemoveItemFromCart.shopana";
import useRemoveItemFromCartShopify from "./useRemoveItemFromCart.shopify";
import { useCartLineFragment_CartLineFragment$key } from "../useCartLineFragment/__generated__/useCartLineFragment_CartLineFragment.graphql";

// Universal interface for removing item from cart
export interface RemoveFromCartInput {
  checkoutLine: useCartLineFragment_CartLineFragment$key;
}

export default cmsPick({
  shopana: useRemoveItemFromCartShopana,
  shopify: useRemoveItemFromCartShopify,
});
