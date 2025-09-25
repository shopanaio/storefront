import useCart from "../useCart";
import { UseIsInCartProps } from "./interface";

const useIsInTheCart = (input: UseIsInCartProps): { isInCart: boolean; quantity: number; cartItemId: string } => {
  const { cart } = useCart();

  if (!cart) return { isInCart: false, quantity: 0, cartItemId: "" };

  const cartLines = cart.lines ?? [];

  // TODO: Fix
  for (const line of cartLines) {
    if (line.purchasableId === input.purchasableId) {
      return {
        isInCart: true,
        quantity: line.quantity,
        cartItemId: line.id,
      };
    }
  }

  return { isInCart: false, quantity: 0, cartItemId: "" };
};

export default useIsInTheCart;
