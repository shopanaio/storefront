import { describe, expect, it } from 'vitest';
import type { model } from '../../../model/namespace';
import type { CartStore } from './CartStore';
import { createCartStore } from './createCartStore';

function createCart(): model.Cart {
  return {
    id: 'cart-1',
    status: 'READY',
    expiresAt: new Date('2026-08-04'),
    resultRevision: 'r1',
    valid: true,
    loyaltyRedemption: null,
    loyaltyRewardEntitlementId: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    totalQuantity: 1,
    cost: {
      subtotalAmount: { amount: 10, currencyCode: 'USD' },
      totalAmount: { amount: 10, currencyCode: 'USD' },
      totalDiscountAmount: null,
      totalTaxAmount: null,
      totalShippingAmount: null,
    },
    lines: [
      {
        id: 'line-1',
        purchasableId: 'variant-1',
        purchasable: undefined as never,
        quantity: 1,
        cost: {
          unitPrice: { amount: 10, currencyCode: 'USD' },
          compareAtUnitPrice: null,
          subtotalAmount: { amount: 10, currencyCode: 'USD' },
          totalAmount: { amount: 10, currencyCode: 'USD' },
        },
      },
    ],
  };
}

describe('createCartStore', () => {
  it('restores an existing line after reverting an optimistic add', () => {
    const initialCart = createCart();
    let state = {
      cart: initialCart,
      loading: false,
      loaded: true,
      error: null,
    } as CartStore;
    const store = createCartStore({
      getState: () => state,
      setState: (nextState) => {
        state = typeof nextState === 'function' ? nextState(state) : nextState;
      },
      subscribe: () => () => {},
    });

    const { revert } = store.checkoutLinesAdd({
      lines: [{ purchasableId: 'variant-1', quantity: 2 }],
      pricing: {
        'variant-1': {
          unitPrice: 12,
          compareAtUnitPrice: 15,
          currencyCode: 'USD',
        },
      },
    });

    expect(state.cart?.lines[0]).toMatchObject({
      quantity: 3,
      cost: {
        unitPrice: { amount: 12, currencyCode: 'USD' },
        compareAtUnitPrice: { amount: 15, currencyCode: 'USD' },
      },
    });
    expect(initialCart.lines[0]).toMatchObject({
      quantity: 1,
      cost: {
        unitPrice: { amount: 10, currencyCode: 'USD' },
        compareAtUnitPrice: null,
      },
    });

    revert();

    expect(state.cart).toBe(initialCart);
    expect(state.cart?.lines[0]).toMatchObject({
      quantity: 1,
      cost: {
        unitPrice: { amount: 10, currencyCode: 'USD' },
        compareAtUnitPrice: null,
      },
    });
  });
});
