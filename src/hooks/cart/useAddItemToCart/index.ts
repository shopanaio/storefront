import { cmsPick } from "@src/cms/pick";
import useAddItemToCartShopana from "./useAddItemToCart.shopana";
import useAddItemToCartShopify from "./useAddItemToCart.shopify";

// Universal interface for adding item to cart
export interface AddToCartInput {
  product: any; // Pass entire object product
  quantity: number;
  attributes?: Array<{ key: string; value: string }>;
}

export default cmsPick({
  shopana: useAddItemToCartShopana,
  shopify: useAddItemToCartShopify,
});
