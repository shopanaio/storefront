import { ApiMoney } from "@codegen/schema-client";
import { useCart } from "./useCart";

export function useIsInTheCart(productId: string): {
  isInCart: boolean;
  quantity: number;
  cartItemId: string;
  subtotal: ApiMoney | null;
} {
  const { cart } = useCart();

  if (!cart || !productId)
    return { isInCart: false, quantity: 0, cartItemId: "", subtotal: null };

  const lines = cart.lines?.edges ?? [];

  for (const edge of lines) {
    const node = edge.node;
    if (node?.purchasable?.id === productId) {
      return {
        isInCart: true,
        quantity: node.quantity ?? 0,
        cartItemId: node.id,
        subtotal: node.cost.subtotalAmount as ApiMoney,
      };
    }
  }

  return { isInCart: false, quantity: 0, cartItemId: "", subtotal: null };
}
