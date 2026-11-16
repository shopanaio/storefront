import { CartStore, StoreImplementation } from './CartStore';
import type { model } from '../../../model/namespace';

let clientLineCounter = 0;
const genClientLineId = () => `client:checkoutLine:${++clientLineCounter}`;

type CartLine = model.Cart['lines'][number];

/**
 * A line the server has not confirmed yet: only its quantity is known. Its cost comes with the
 * server answer; until then the cart shows no money for it.
 */
const createOptimisticLine = (
  purchasableId: string,
  quantity: number,
  currencyCode: model.Money['currencyCode']
): CartLine => {
  const zero = { amount: 0, currencyCode };
  return {
    isOptimistic: true,
    id: genClientLineId(),
    purchasableId,
    purchasable: null,
    quantity,
    cost: {
      unitPrice: zero,
      compareAtUnitPrice: null,
      subtotalAmount: zero,
      discountAmount: zero,
      totalAmount: zero,
    },
  };
};

const withQuantity = (line: CartLine, quantity: number): CartLine => ({
  ...line,
  quantity: Math.max(0, quantity),
});

/**
 * The cart with changed lines. Only quantities change on the client: the cost stays as the
 * server calculated it until the server answers the write.
 */
const withLines = (cart: model.Cart, lines: CartLine[]): model.Cart => ({
  ...cart,
  lines,
  totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
});

/**
 * Factory function to create cart store with any state manager
 * This allows using Zustand, Redux, MobX, or custom implementation
 */
export function createCartStore(
  impl: StoreImplementation<CartStore>
): CartStore {
  const store: CartStore = {
    get cart() {
      return impl.getState().cart;
    },
    get loading() {
      return impl.getState().loading;
    },
    get loaded() {
      return impl.getState().loaded;
    },
    get error() {
      return impl.getState().error;
    },

    setCart(cart: model.Cart | null) {
      impl.setState({
        ...impl.getState(),
        cart,
        loading: false,
        loaded: true,
        error: null,
      });
    },

    checkoutLinesAdd(input) {
      const state = impl.getState();
      if (!state.cart) return { revert: () => {} };

      const prev = state.cart;
      const nextLines = [...prev.lines];

      for (const l of input.lines) {
        const existingIndex = nextLines.findIndex(
          (x) => x.purchasableId === l.purchasableId
        );
        if (existingIndex >= 0) {
          nextLines[existingIndex] = withQuantity(
            nextLines[existingIndex],
            nextLines[existingIndex].quantity + l.quantity
          );
        } else {
          nextLines.push(
            createOptimisticLine(
              l.purchasableId,
              l.quantity,
              prev.cost.totalAmount.currencyCode
            )
          );
        }
      }

      impl.setState({ ...state, cart: withLines(prev, nextLines) });

      return {
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev });
        },
      };
    },

    checkoutLinesDelete(input) {
      const state = impl.getState();
      if (!state.cart) return { revert: () => {} };

      const prev = state.cart;
      const nextLines = prev.lines.filter((l) => !input.lineIds.includes(l.id));

      impl.setState({ ...state, cart: withLines(prev, nextLines) });

      return {
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev });
        },
      };
    },

    checkoutLinesUpdate(input) {
      const state = impl.getState();
      if (!state.cart) return { revert: () => {} };

      const prev = state.cart;
      const map = new Map(input.lines.map((l) => [l.lineId, l.quantity]));
      // A line set to zero leaves the cart at once.
      const nextLines = prev.lines
        .map((l) => {
          const quantity = map.get(l.id);
          return quantity === undefined ? l : withQuantity(l, quantity);
        })
        .filter((l) => l.quantity > 0);

      impl.setState({ ...state, cart: withLines(prev, nextLines) });

      return {
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev });
        },
      };
    },

    checkoutLinesReplace(input) {
      const state = impl.getState();
      if (!state.cart) return { revert: () => {} };

      const prev = state.cart;
      const nextLines = [...prev.lines];

      for (const replacement of input.lines) {
        const srcIdx = nextLines.findIndex(
          (line) => line.id === replacement.lineId
        );
        if (srcIdx < 0) continue;

        const source = nextLines[srcIdx];
        const availableQty = Math.max(0, source.quantity);
        const requestedQty =
          replacement.quantity == null
            ? availableQty
            : Math.min(Math.max(replacement.quantity, 0), availableQty);

        if (requestedQty <= 0) {
          continue;
        }

        const remainingQty = Math.max(availableQty - requestedQty, 0);

        if (remainingQty > 0) {
          nextLines[srcIdx] = withQuantity(source, remainingQty);
        } else {
          nextLines.splice(srcIdx, 1);
        }

        const targetIdx = nextLines.findIndex(
          (line) =>
            line.purchasableId === replacement.purchasableId &&
            line.id !== source.id
        );

        if (targetIdx >= 0) {
          nextLines[targetIdx] = withQuantity(
            nextLines[targetIdx],
            nextLines[targetIdx].quantity + requestedQty
          );
        } else {
          nextLines.push(
            createOptimisticLine(
              replacement.purchasableId,
              requestedQty,
              prev.cost.totalAmount.currencyCode
            )
          );
        }
      }

      impl.setState({ ...state, cart: withLines(prev, nextLines) });

      return {
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev });
        },
      };
    },

    checkoutClear() {
      const state = impl.getState();
      if (!state.cart) return { revert: () => {} };

      const prev = state.cart;

      impl.setState({ ...state, cart: withLines(prev, []) });

      return {
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev });
        },
      };
    },
  };

  return store;
}
