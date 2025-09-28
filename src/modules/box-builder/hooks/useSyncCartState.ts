import { useEffect } from "react";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useBoxBuilderCart } from "@src/modules/box-builder/hooks/useCart";

export function useSyncCartState() {
  const { cart, loaded } = useBoxBuilderCart();
  const { boxProductIds, cardProductIds, setBoxProductIds, setCardProductIds } =
    useBoxBuilderStore();

  useEffect(() => {
    if (!loaded || !cart?.lines) {
      return;
    }

    const idsInCart = new Set<string>();
    cart.lines.forEach((line) => {
      if (line?.purchasableId) {
        idsInCart.add(line?.purchasableId);
      }
    });

    const remainingBoxProductIds = boxProductIds.filter((id) => {
      return idsInCart.has(id);
    });
    const remainingCardProductIds = cardProductIds.filter((id) => {
      return idsInCart.has(id);
    });
    setBoxProductIds(remainingBoxProductIds);
    setCardProductIds(remainingCardProductIds);
  }, [loaded, cart]);
}
