import { CartStore, StoreImplementation } from './CartStore';
import type { model } from '../../../model';
import { recalcCart } from '../core/utils';

let clientLineCounter = 0;
const genClientLineId = () => `client:checkoutLine:${++clientLineCounter}`;

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
    get version() {
      return impl.getState().version;
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
      if (!state.cart) return { version: state.version, revert: () => {} };

      const prev = state.cart;
      const base = state.cart;
      const nextLines = [...base.lines];

      for (const l of input.lines) {
        const existing = nextLines.find(
          (x) => x.purchasableId === l.purchasableId
        );
        const price = input.pricing?.[l.purchasableId];

        if (existing) {
          existing.quantity = Math.max(0, existing.quantity + l.quantity);
          if (price) {
            existing.cost.unitPrice = {
              amount: price.unitPrice,
              currencyCode: price.currencyCode,
            };
            existing.cost.compareAtUnitPrice =
              price.compareAtUnitPrice != null
                ? {
                    amount: price.compareAtUnitPrice,
                    currencyCode: price.currencyCode,
                  }
                : (existing.cost.compareAtUnitPrice ?? null);
          }
        } else {
          const currencyCode =
            price?.currencyCode || base.cost.totalAmount.currencyCode;
          nextLines.push({
            id: genClientLineId(),
            purchasableId: l.purchasableId,
            purchasable: undefined as any,
            quantity: l.quantity,
            cost: {
              unitPrice: { amount: price?.unitPrice ?? 0, currencyCode },
              compareAtUnitPrice:
                price?.compareAtUnitPrice != null
                  ? { amount: price.compareAtUnitPrice, currencyCode }
                  : null,
              subtotalAmount: { amount: 0, currencyCode },
              totalAmount: { amount: 0, currencyCode },
            },
          });
        }
      }

      const nextCart = recalcCart({ ...base, lines: nextLines });
      const nextVersion = state.version + 1;

      impl.setState({
        ...state,
        cart: nextCart,
        version: nextVersion,
      });

      return {
        version: nextVersion,
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev, version: nextVersion - 1 });
        },
      };
    },

    checkoutLinesDelete(input) {
      const state = impl.getState();
      if (!state.cart) return { version: state.version, revert: () => {} };

      const prev = state.cart;
      const base = state.cart;
      const nextLines = base.lines.filter((l) => !input.lineIds.includes(l.id));
      const nextCart = recalcCart({ ...base, lines: nextLines });
      const nextVersion = state.version + 1;

      impl.setState({
        ...state,
        cart: nextCart,
        version: nextVersion,
      });

      return {
        version: nextVersion,
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev, version: nextVersion - 1 });
        },
      };
    },

    checkoutLinesUpdate(input) {
      const state = impl.getState();
      if (!state.cart) return { version: state.version, revert: () => {} };

      const prev = state.cart;
      const base = state.cart;
      const map = new Map(input.lines.map((l) => [l.lineId, l.quantity]));
      const nextLines = base.lines
        .map((l) =>
          map.has(l.id)
            ? { ...l, quantity: Math.max(0, map.get(l.id) as number) }
            : l
        )
        .filter((l) => l.quantity > 0);
      const nextCart = recalcCart({ ...base, lines: nextLines });
      const nextVersion = state.version + 1;

      impl.setState({
        ...state,
        cart: nextCart,
        version: nextVersion,
      });

      return {
        version: nextVersion,
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev, version: nextVersion - 1 });
        },
      };
    },

    checkoutLinesReplace(input) {
      const state = impl.getState();
      if (!state.cart) return { version: state.version, revert: () => {} };

      const prev = state.cart;
      const base = state.cart;
      const nextLines = [...base.lines];

      for (const replacement of input.lines) {
        const srcIdx = nextLines.findIndex((line) => line.id === replacement.lineId);
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
          nextLines[srcIdx] = { ...source, quantity: remainingQty };
        } else {
          nextLines.splice(srcIdx, 1);
        }

        const price = input.pricing?.[replacement.purchasableId];
        const currencyCode =
          price?.currencyCode || base.cost.totalAmount.currencyCode;
        const targetIdx = nextLines.findIndex(
          (line) =>
            line.purchasableId === replacement.purchasableId && line.id !== source.id
        );

        if (targetIdx >= 0) {
          const target = nextLines[targetIdx];
          const updatedTarget = {
            ...target,
            quantity: Math.max(0, target.quantity + requestedQty),
            cost: target.cost,
          };

          if (price) {
            updatedTarget.cost = {
              ...target.cost,
              unitPrice: { amount: price.unitPrice, currencyCode },
              compareAtUnitPrice:
                price.compareAtUnitPrice != null
                  ? { amount: price.compareAtUnitPrice, currencyCode }
                  : (target.cost.compareAtUnitPrice ?? null),
            };
          }

          nextLines[targetIdx] = updatedTarget;
        } else {
          nextLines.push({
            id: genClientLineId(),
            purchasableId: replacement.purchasableId,
            purchasable: undefined as any,
            quantity: requestedQty,
            cost: {
              unitPrice: { amount: price?.unitPrice ?? 0, currencyCode },
              compareAtUnitPrice:
                price?.compareAtUnitPrice != null
                  ? { amount: price.compareAtUnitPrice, currencyCode }
                  : null,
              subtotalAmount: { amount: 0, currencyCode },
              totalAmount: { amount: 0, currencyCode },
            },
          });
        }
      }

      const nextCart = recalcCart({ ...base, lines: nextLines });
      const nextVersion = state.version + 1;

      impl.setState({
        ...state,
        cart: nextCart,
        version: nextVersion,
      });

      return {
        version: nextVersion,
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev, version: nextVersion - 1 });
        },
      };
    },

    checkoutClear() {
      const state = impl.getState();
      if (!state.cart) return { version: state.version, revert: () => {} };

      const prev = state.cart;
      const base = state.cart;
      const currencyCode = base.cost.totalAmount.currencyCode;
      const empty: model.Cart = {
        ...base,
        totalQuantity: 0,
        lines: [],
        cost: {
          subtotalAmount: { amount: 0, currencyCode },
          totalAmount: { amount: 0, currencyCode },
          totalDiscountAmount: { amount: 0, currencyCode },
          totalTaxAmount: { amount: 0, currencyCode },
          totalShippingAmount: { amount: 0, currencyCode },
        },
      };
      const nextVersion = state.version + 1;

      impl.setState({
        ...state,
        cart: empty,
        version: nextVersion,
      });

      return {
        version: nextVersion,
        revert: () => {
          impl.setState({ ...impl.getState(), cart: prev, version: nextVersion - 1 });
        },
      };
    },
  };

  return store;
}
