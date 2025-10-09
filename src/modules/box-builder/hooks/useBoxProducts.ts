import type { Entity } from "@shopana/entity";
import { useBoxBuilderCart } from "@src/modules/box-builder/hooks/useCart";
import { useBoxBuilderStore } from "@src/store/appStore";

interface BoxCartLines {
  boxes: Entity.CartLine[];
  cards: Entity.CartLine[];
  products: Entity.CartLine[];
}

export const useBoxBuilderProducts = () => {
  const { cart } = useBoxBuilderCart();
  const { boxProductIds, cardProductIds } = useBoxBuilderStore();

  const result: BoxCartLines = {
    boxes: [],
    cards: [],
    products: [],
  };

  cart?.lines.forEach((line) => {
    if (boxProductIds.includes(line.purchasableId)) {
      result.boxes.push(line);
    } else if (cardProductIds.includes(line.purchasableId)) {
      result.cards.push(line);
    } else {
      result.products.push(line);
    }
  });

  return result;
};
