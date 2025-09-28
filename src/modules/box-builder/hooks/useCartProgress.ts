import { Entity } from "@src/entity";
import { useBoxBuilderCart } from "./useCart";
import { useBoxBuilderProducts } from "@src/modules/box-builder/hooks/useBoxProducts";

export function useBoxBuilderProgress() {
  const { cart } = useBoxBuilderCart();
  const { boxes, cards, products } = useBoxBuilderProducts();

  const totalQuantity = cart?.totalQuantity ?? 0;
  const MAX_PRODUCTS_COUNT = 10;
  const progress = (totalQuantity / MAX_PRODUCTS_COUNT) * 100;

  return {
    progress,
    totalQuantity,
    boxes: {
      products: boxes,
      quantity: boxes.reduce((acc, box) => acc + box.quantity, 0),
      totalAmount: {
        currencyCode: cart?.cost?.totalAmount?.currencyCode,
        amount: boxes
          .reduce(
            (acc, cartLine) =>
              acc + parseFloat(cartLine?.cost.totalAmount?.amount ?? "0"),
            0
          )
          .toFixed(2),
      } as Entity.Money,
    },
    products: {
      products: products,
      quantity: products.reduce((acc, product) => acc + product.quantity, 0),
      totalAmount: {
        currencyCode: cart?.cost?.totalAmount?.currencyCode,
        amount: products
          .reduce(
            (acc, cartLine) =>
              acc + parseFloat(cartLine?.cost.totalAmount?.amount ?? "0"),
            0
          )
          .toFixed(2),
      } as Entity.Money,
    },
    cards: {
      products: cards,
      quantity: cards.reduce((acc, card) => acc + card.quantity, 0),
      totalAmount: {
        currencyCode: cart?.cost?.totalAmount?.currencyCode,
        amount: cards
          .reduce(
            (acc, cartLine) =>
              acc + parseFloat(cartLine?.cost?.totalAmount?.amount ?? "0"),
            0
          )
          .toFixed(2),
      } as Entity.Money,
    },
  };
}
