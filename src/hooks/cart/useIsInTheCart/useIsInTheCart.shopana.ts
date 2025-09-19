import { readInlineData } from "react-relay";
import { useCartLineFragment_CartLineFragment } from "../useCartLineFragment/useCartLineFragment.shopana";
import useCart from "../useCart";
import { UseIsInCartProps } from "./interface";

const useIsInTheCart = (input: UseIsInCartProps): { isInCart: boolean; quantity: number; cartItemId: string } => {
  const { cart } = useCart();

  if (!cart || !input.product) return { isInCart: false, quantity: 0, cartItemId: "" };

  const lines = cart.lines?.edges ?? [];
  const productId = input.product.id; // Extract ID from product

  for (const edge of lines) {
    // Use readInlineData to read data from fragment outside React render phase
    const cartLineData = readInlineData(useCartLineFragment_CartLineFragment, edge.node);

    if (cartLineData?.purchasable?.id === productId) {
      return {
        isInCart: true,
        quantity: cartLineData.quantity ?? 0,
        cartItemId: cartLineData.id,
      };
    }
  }

  return { isInCart: false, quantity: 0, cartItemId: "" };
};

export default useIsInTheCart;
