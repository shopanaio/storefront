import { create } from 'zustand';
import type { model } from '@shopana/storefront-sdk';
import { recalcCart } from './cartMath';

export interface CartStoreState {
  cart: model.Cart | null;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  version: number;
  setCart: (cart: model.Cart | null) => void;
  // item operations compatible with mutations
  checkoutLinesAdd: (input: {
    lines: {
      purchasableId: string;
      quantity: number;
      children?: { quantity: number }[];
    }[];
    pricing?: Record<
      string,
      { unitPrice: number; compareAtUnitPrice?: number; currencyCode: string }
    >;
  }) => { version: number; revert: () => void };
  checkoutLinesDelete: (input: { lineIds: string[] }) => {
    version: number;
    revert: () => void;
  };
  checkoutLinesReplace: (input: {
    lines: { lineId: string; purchasableId: string; quantity?: number }[];
    pricing?: Record<
      string,
      { unitPrice: number; compareAtUnitPrice?: number; currencyCode: string }
    >;
  }) => { version: number; revert: () => void };
  checkoutLinesUpdate: (input: {
    lines: { lineId: string; quantity: number }[];
  }) => { version: number; revert: () => void };
  checkoutClear: () => { version: number; revert: () => void };
}

let clientLineCounter = 0;
const genClientLineId = () => `client:checkoutLine:${++clientLineCounter}`;

export const useCartStore = create<CartStoreState>((set, get) => ({
  cart: null,
  loading: false,
  loaded: false,
  error: null,
  version: 0,

  setCart: (cart) => {
    set({
      cart: cart,
      loading: false,
      loaded: true,
      error: null,
    });
  },
  checkoutLinesAdd: ({ lines, pricing }) => {
    const state = get();
    if (!state.cart) return { version: state.version, revert: () => {} };
    const base = state.cart;
    const prev = state.cart;
    const nextLines = [...base.lines];

    for (const l of lines) {
      const existing = nextLines.find(
        (x) => x.purchasableId === l.purchasableId
      );
      const price = pricing?.[l.purchasableId];
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

    const next = recalcCart({ ...base, lines: nextLines });
    const version = state.version + 1;
    set({ cart: next, version });
    return { version, revert: () => set({ cart: prev, version: version - 1 }) };
  },

  checkoutLinesDelete: ({ lineIds }) => {
    const state = get();
    if (!state.cart) return { version: state.version, revert: () => {} };
    const base = state.cart;
    const prev = state.cart;
    const nextLines = base.lines.filter((l) => !lineIds.includes(l.id));
    const next = recalcCart({ ...base, lines: nextLines });
    const version = state.version + 1;
    set({ cart: next, version });
    return { version, revert: () => set({ cart: prev, version: version - 1 }) };
  },

  checkoutLinesReplace: ({ lines, pricing }) => {
    const state = get();
    if (!state.cart) return { version: state.version, revert: () => {} };
    const base = state.cart;
    const prev = state.cart;
    const nextLines = [...base.lines];

    for (const input of lines) {
      const srcIdx = nextLines.findIndex((line) => line.id === input.lineId);
      if (srcIdx < 0) continue;

      const source = nextLines[srcIdx];
      const availableQty = Math.max(0, source.quantity);
      const requestedQty =
        input.quantity == null
          ? availableQty
          : Math.min(Math.max(input.quantity, 0), availableQty);

      if (requestedQty <= 0) {
        continue;
      }

      const remainingQty = Math.max(availableQty - requestedQty, 0);

      if (remainingQty > 0) {
        nextLines[srcIdx] = { ...source, quantity: remainingQty };
      } else {
        nextLines.splice(srcIdx, 1);
      }

      const price = pricing?.[input.purchasableId];
      const currencyCode =
        price?.currencyCode || base.cost.totalAmount.currencyCode;
      const targetIdx = nextLines.findIndex(
        (line) =>
          line.purchasableId === input.purchasableId && line.id !== source.id
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
          purchasableId: input.purchasableId,
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

    const next = recalcCart({ ...base, lines: nextLines });
    const version = state.version + 1;
    set({ cart: next, version });
    return { version, revert: () => set({ cart: prev, version: version - 1 }) };
  },

  checkoutLinesUpdate: ({ lines }) => {
    const state = get();
    if (!state.cart) return { version: state.version, revert: () => {} };
    const base = state.cart;
    const prev = state.cart;
    const map = new Map(lines.map((l) => [l.lineId, l.quantity]));
    const nextLines = base.lines
      .map((l) =>
        map.has(l.id)
          ? { ...l, quantity: Math.max(0, map.get(l.id) as number) }
          : l
      )
      .filter((l) => l.quantity > 0);
    const next = recalcCart({ ...base, lines: nextLines });
    const version = state.version + 1;
    set({ cart: next, version });
    return { version, revert: () => set({ cart: prev, version: version - 1 }) };
  },

  checkoutClear: () => {
    const state = get();
    if (!state.cart) return { version: state.version, revert: () => {} };
    const base = state.cart;
    const prev = state.cart;
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
    const version = state.version + 1;
    set({ cart: empty, version });
    return { version, revert: () => set({ cart: prev, version: version - 1 }) };
  },
}));
