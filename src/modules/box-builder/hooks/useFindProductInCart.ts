import { ApiMoney } from "@codegen/schema-client";
import { useCart } from "./useCart";

type ProductInCart = {
  id: string;
  title: string;
  price: ApiMoney;
  quantity: number;
  cost: { totalAmount: ApiMoney };
} | null;

export function useFindProductInCart(productId: string | null): ProductInCart {
  const { cart } = useCart();

  if (!productId || !cart?.lines?.edges) return null;

  for (const edge of cart.lines.edges) {
    const purchasable = edge.node.purchasable;
    if (purchasable?.id === productId) {
      return {
        ...purchasable,
        quantity: edge.node.quantity,
        cost: edge.node.cost,
      } as any;
    }
  }

  return null;
}
