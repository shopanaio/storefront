import { useBoxBuilderCart } from "./useCart";

export function useIsInTheBoxBuilderCart(purchasableId: string) {
  const { cart } = useBoxBuilderCart();

  for (const line of cart?.lines || []) {
    if (line?.purchasableId === purchasableId) {
      return line;
    }
  }

  return null;
}
