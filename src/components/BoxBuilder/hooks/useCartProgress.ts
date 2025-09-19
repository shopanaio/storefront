import { useCart } from "./useCart";
import { useBoxBuilderStore } from "@src/store/appStore";

export function useCartProgress() {
  const { cart } = useCart();
  const { selectedBoxId, selectedCardIds } = useBoxBuilderStore();

  const cartCount = cart?.totalQuantity ?? 0;

  type PurchasableWithQty = {
    id: string;
    title?: string;
    price?: { amount: number; currencyCode: string };
    quantity: number;
  } | null;

  type UnknownRecord = Record<string, unknown>;

  const readMoney = (value: unknown): { amount: number; currencyCode: string } | undefined => {
    const rec = value as UnknownRecord | undefined;
    if (!rec) return undefined;
    const amount = rec.amount;
    const currencyCode = rec.currencyCode;
    return typeof amount === "number" && typeof currencyCode === "string"
      ? { amount, currencyCode }
      : undefined;
  };

  const findProductInCart = (productId: string | null): PurchasableWithQty => {
    if (!productId || !cart?.lines?.edges) return null;

    for (const edge of cart.lines.edges) {
      const purch = edge.node.purchasable as UnknownRecord | undefined;
      const id = (purch?.id as string) || "";
      if (id === productId) {
        const title = purch?.title as string | undefined;
        const price = readMoney((purch as UnknownRecord)?.price);
        const item: Exclude<PurchasableWithQty, null> = {
          id,
          title,
          price,
          quantity: edge.node.quantity,
        };
        return item;
      }
    }
    return null;
  };

  const selectedBoxInCart = findProductInCart(selectedBoxId);
  const selectedEnvelopesInCart = selectedCardIds
    .map((id) => findProductInCart(id))
    .filter(Boolean) as Exclude<PurchasableWithQty, null>[];

  // Products without box and cards
  const productsOnlyItems: Exclude<PurchasableWithQty, null>[] = [];
  if (cart?.lines?.edges) {
    for (const edge of cart.lines.edges) {
      const purch = edge.node.purchasable as UnknownRecord | undefined;
      const id = (purch?.id as string) || "";
      if (!id) continue;
      if (id === selectedBoxId) continue;
      if (selectedCardIds.includes(id)) continue;
      const title = purch?.title as string | undefined;
      const price = readMoney((purch as UnknownRecord)?.price);
      productsOnlyItems.push({
        id,
        title,
        price,
        quantity: edge.node.quantity,
      });
    }
  }

  const boxQuantityInCart = selectedBoxInCart ? selectedBoxInCart.quantity : 0;
  const envelopesQuantityInCart = selectedEnvelopesInCart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  const productsOnlyCount = cartCount - boxQuantityInCart - envelopesQuantityInCart;

  const envelopesTotalPriceAmount = selectedEnvelopesInCart.reduce(
    (sum, item) => sum + ((item.price?.amount ?? 0) * (item.quantity ?? 0)),
    0,
  );

  const MAX_PRODUCTS_COUNT = 10;
  const progressPercent = (cartCount / MAX_PRODUCTS_COUNT) * 100;

  return {
    progressPercent,
    productsOnlyCount,
    cartCount,
    boxQuantityInCart,
    envelopeQuantityInCart: envelopesQuantityInCart,
    selectedBoxInCart,
    selectedEnvelopeInCart: selectedEnvelopesInCart[0] ?? null,
    selectedEnvelopesInCart,
    envelopesTotalPriceAmount,
    productsOnlyItems,
  };
}
