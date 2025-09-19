/* import { useCart } from "./useCart";

type ProductInCart = {
  id: string;
  title: string;
  price: {
    amount: number;
    currencyCode: string;
  };
  quantity: number;
  cost: {
    totalAmount: {
      amount: number;
      currencyCode: string;
    };
  };
} | null;
 */
/**
 * Finds product in cart by ID and returns it with additional information
 * @param productId Product ID to search for
 * @returns Object with cart item information or null
 */
/* export function useFindProductInCart(productId: string | null): ProductInCart {
  const { cart } = useCart();

  if (!productId || !cart?.lines?.edges) return null;

  for (const edge of cart.lines.edges) {
    const purchasable = edge.node.purchasable;
    if (purchasable?.id === productId) {
      return {
        ...purchasable,
        quantity: edge.node.quantity,
        cost: edge.node.cost,
      };
    }
  }

  return null;
} */
