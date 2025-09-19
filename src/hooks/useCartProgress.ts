/* import { useCart } from "./useCart";
import { useBoxBuilderStore } from "@src/store/appStore";

export function useCartProgress() {
  const { cart } = useCart();
  const { selectedBoxId, selectedCardIds } = useBoxBuilderStore();

  const cartCount = cart?.totalQuantity ?? 0;

  const findProductInCart = (productId: string | null) => {
    if (!productId || !cart?.lines?.edges) return null;

    for (const edge of cart.lines.edges) {
      const purchasable = edge.node.purchasable;
      if (purchasable?.id === productId) {
        return {
          ...purchasable,
          quantity: edge.node.quantity,
        };
      }
    }
    return null;
  };

  const selectedBoxInCart = findProductInCart(selectedBoxId);
  const selectedEnvelopesInCart = selectedCardIds
    .map((id) => findProductInCart(id))
    .filter(Boolean) as Array<{
      id: string;
      title?: string;
      price?: { amount: number; currencyCode: string };
      quantity: number;
    }>;

  const boxQuantityInCart = selectedBoxInCart ? selectedBoxInCart.quantity : 0;
  const envelopeQuantityInCart = selectedEnvelopesInCart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );
  const productsOnlyCount =
    cartCount - boxQuantityInCart - envelopeQuantityInCart;

  const progressPercent = (productsOnlyCount / 20) * 100;

  return {
    progressPercent,
    productsOnlyCount,
    cartCount,
    boxQuantityInCart,
    envelopeQuantityInCart,
    selectedBoxInCart,
    selectedEnvelopeInCart: selectedEnvelopesInCart[0] ?? null,
  };
}
 */