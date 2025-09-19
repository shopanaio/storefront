import { useEffect } from "react";
import { useBoxBuilderStore } from "@src/store/appStore";

type UnknownRecord = Record<string, unknown>;

export function useSyncCartState(cart: UnknownRecord | null | undefined, isCartLoaded: boolean) {
  const selectedCardIds = useBoxBuilderStore((s) => s.selectedCardIds);
  const removeSelectedCardId = useBoxBuilderStore((s) => s.removeSelectedCardId);
  const selectedBoxId = useBoxBuilderStore((s) => s.selectedBoxId);
  const setSelectedBoxId = useBoxBuilderStore((s) => s.setSelectedBoxId);

  useEffect(() => {
    if (!isCartLoaded) return;

    const edges = (cart as any)?.lines?.edges ?? [];
    // If cart is empty or missing, edges will be empty array — this is ok,
    // synchronization below will clear ids that are not in cart

    const idsInCart = new Set<string>();
    for (const edge of (Array.isArray(edges) ? edges : [])) {
      const id = edge?.node?.purchasable?.id as string | undefined;
      if (id) idsInCart.add(id);
    }

    for (const id of selectedCardIds) {
      if (!idsInCart.has(id)) {
        removeSelectedCardId(id);
      }
    }

    if (selectedBoxId && !idsInCart.has(selectedBoxId)) {
      setSelectedBoxId("");
    }
  }, [isCartLoaded, cart, selectedCardIds, selectedBoxId, removeSelectedCardId, setSelectedBoxId]);
}
