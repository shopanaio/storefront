import { cmsPick } from "@src/cms/pick";
import useAddItemToCartShopana from "./useAddItemToCart.shopana";
import useAddItemToCartShopify from "./useAddItemToCart.shopify";

// Universal interface for adding item to cart
export interface AddToCartInput {
  productVariantId: string;
  quantity: number;
}

export default cmsPick({
  shopana: useAddItemToCartShopana,
  shopify: useAddItemToCartShopify,
});
