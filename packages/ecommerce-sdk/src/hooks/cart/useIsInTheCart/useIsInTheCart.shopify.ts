import { readInlineData } from "react-relay";
import { useCartLineFragment_CartLineFragment } from "../useCartLineFragment/useCartLineFragment.shopify";
import useCart from "../useCart";
import { UseIsInCartProps } from "./interface";

/**
 * Checks if a product with specified ID is in cart and returns its quantity
 * @param input Object with product - entire product object
 */
const useIsInTheCart = (input: UseIsInCartProps): { isInCart: boolean; quantity: number; cartItemId: string } => {
  const { cart } = useCart();

  if (!cart || !input.product) return { isInCart: false, quantity: 0, cartItemId: "" };

  const lines = cart.lines?.edges ?? [];

  // In Shopify check both productId and variantId
  const productId = input.product.id;
  const variantId = input.product.variants?.[0]?.id;

  for (const edge of lines) {
    // Use readInlineData to read data from fragment outside React render phase
    const cartLineData = readInlineData(useCartLineFragment_CartLineFragment, edge.node);

    if (cartLineData?.merchandise?.id === productId ||
      cartLineData?.merchandise?.id === variantId) {
      return {
        isInCart: true,
        quantity: cartLineData.quantity ?? 0,
        cartItemId: cartLineData.id
      };
    }
  }

  return { isInCart: false, quantity: 0, cartItemId: "" };
};

export default useIsInTheCart;
