import React from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CombinedGraphQLErrors, type TypedDocumentNode } from '@apollo/client';
import type { SdkCartFragment_CartFragment } from '../../../../graphql/apollo/generated/operations';
import { mapShopanaCheckoutToEntityCart } from '../../core/mappers/mapShopanaToEntityCart';
import type { CartConfig } from '../../core/config';
import { clearCartMutation } from '../../core/graphql/mutations/clearCartMutation';
import { updateCartLineQuantityMutation } from '../../core/graphql/mutations/updateCartLineQuantityMutation';
import { addToCartMutation } from '../../core/graphql/mutations/addToCartMutation';
import { createCartStoreZustand } from '../store/CartStoreZustand';
import { useCartContext } from '../context/CartContext';
import useAddItemToCart from '../hooks/useAddItemToCart';
import useRemoveItemFromCart from '../hooks/useRemoveItemFromCart';
import useReplaceCartItem from '../hooks/useReplaceCartItem';
import useClearCart from '../hooks/useClearCart';
import useUpdateCartLineQuantity from '../hooks/useUpdateCartLineQuantity';
import { CartProvider } from './CartProvider';

const { requests, cartQuery } = vi.hoisted(() => ({
  cartQuery: {
    current: { loading: false, data: undefined } as {
      loading: boolean;
      data: unknown;
      error?: unknown;
      refetch?: () => Promise<unknown>;
    },
  },
  requests: [] as Array<{
    document: TypedDocumentNode;
    variables: {
      input: {
        checkoutId?: string;
        lines?: Array<{ lineId: string }>;
        lineIds?: string[];
      };
    };
    resolve: (result: { data: unknown }) => void;
    reject: (error: Error) => void;
  }>,
}));

vi.mock('@apollo/client/react', () => ({
  useQuery: () => cartQuery.current,
  useMutation: (document: TypedDocumentNode) => [
    ({ variables }: { variables: (typeof requests)[number]['variables'] }) =>
      new Promise((resolve, reject) => {
        requests.push({ document, variables, resolve, reject });
      }),
    { loading: false },
  ],
}));

function checkout(quantity: number): SdkCartFragment_CartFragment {
  const money = (amount: number) => ({
    __typename: 'Money' as const,
    currencyCode: 'USD' as const,
    amount,
  });
  return {
    __typename: 'Checkout',
    id: 'cart-1',
    channelCode: 'online-store',
    localeCode: 'en',
    currencyCode: 'USD',
    resultRevision: `revision-${quantity}`,
    valid: true,
    status: 'READY',
    expiresAt: '2026-11-01T00:00:00Z',
    createdAt: '2026-10-17T00:00:00Z',
    updatedAt: '2026-10-17T00:00:00Z',
    totalQuantity: quantity,
    issues: [],
    notifications: [],
    tags: [],
    guestCheckoutAllowed: true,
    promoCodes: [],
    loyaltyEarning: null,
    cost: {
      __typename: 'CheckoutCost',
      subtotalAmount: money(quantity * 10),
      totalAmount: money(quantity * 10),
      totalDiscountAmount: money(0),
      totalTaxAmount: money(0),
      totalShippingAmount: money(0),
      merchandiseDiscountAmount: money(0),
      loyaltyAmount: money(0),
    },
    lines: quantity
      ? [
          {
            __typename: 'CheckoutLine',
            id: 'line-1',
            title: 'Variant 1',
            sku: null,
            purchasableId: 'variant-1',
            quantity,
            attributes: {},
            children: [],
            purchase: { __typename: 'CheckoutLinePurchase', type: 'ONE_TIME' },
            cost: {
              __typename: 'CheckoutLineCost',
              unitPrice: money(10),
              compareAtUnitPrice: money(10),
              subtotalAmount: money(quantity * 10),
              totalAmount: money(quantity * 10),
            },
            purchasable: {
              __typename: 'ProductVariant',
              id: 'variant-1',
              handle: 'variant',
              isAvailable: true,
              currentlyNotInStock: false,
              selectedOptions: [],
              product: {
                __typename: 'Product',
                id: 'product-1',
                handle: 'product',
                title: 'Product',
              },
            },
          },
        ]
      : [],
  };
}

const config: CartConfig = {
  defaultCurrency: 'USD',
  defaultLocale: 'en',
  channelCode: 'online-store',
  cookieName: 'review-test-cart',
  cookieOptions: { secure: false },
};

function mount(initialCheckout?: SdkCartFragment_CartFragment) {
  const original = mapShopanaCheckoutToEntityCart(
    initialCheckout ?? checkout(1)
  );
  const store = createCartStoreZustand(original);
  const hook = renderHook(
    () => ({
      ...useAddItemToCart(),
      ...useRemoveItemFromCart(),
      ...useReplaceCartItem(),
      ...useClearCart(),
      ...useUpdateCartLineQuantity(),
      context: useCartContext(),
    }),
    {
      wrapper: ({ children }) => (
        <CartProvider
          store={store}
          config={config}
          initialCart={initialCheckout}
        >
          {children}
        </CartProvider>
      ),
    }
  );
  return { ...hook, store: store.store, original };
}

afterEach(() => {
  cleanup();
  cartQuery.current = { loading: false, data: undefined };
  requests.length = 0;
  document.cookie = 'review-test-cart=; Path=/; Max-Age=0';
});

describe('cart mutation reconciliation', () => {
  it('serializes clear after an update and retains the confirmed empty cart', async () => {
    const { result, store } = mount(checkout(1));
    let update!: Promise<unknown>;
    let clear!: Promise<unknown>;
    await act(async () => {
      update = result.current.updateQuantity({
        cartItemId: 'line-1',
        quantity: 2,
      })!;
      clear = result.current.clearCart();
    });
    expect(requests.map((request) => request.document)).toEqual([
      updateCartLineQuantityMutation,
    ]);

    await act(async () => {
      requests[0].resolve({
        data: { checkoutLinesUpdate: { checkout: checkout(2), errors: [] } },
      });
      await update;
    });
    expect(requests.map((request) => request.document)).toEqual([
      updateCartLineQuantityMutation,
      clearCartMutation,
    ]);

    const empty = checkout(0);
    await act(async () => {
      requests[1].resolve({
        data: { checkoutLinesClear: { checkout: empty, errors: [] } },
      });
      await clear;
    });
    expect(store.cart?.lines).toEqual([]);
    expect(store.cart?.totalQuantity).toBe(0);
    expect(result.current.context.cartKey).toBe(empty);
    expect(result.current.context.cartId).toBe('cart-1');
  });

  it.each(['network', 'userErrors'])(
    'restores a seeded store after a %s failure without an initial checkout',
    async (failure) => {
      const { result, store, original } = mount();
      let update!: Promise<unknown>;
      let rejected!: Promise<void>;
      await act(async () => {
        update = result.current.updateQuantity({
          cartItemId: 'line-1',
          quantity: 2,
        })!;
        rejected = expect(update).rejects.toBeDefined();
      });
      expect(store.cart?.lines[0].quantity).toBe(2);

      await act(async () => {
        if (failure === 'network') requests[0].reject(new Error('offline'));
        else
          requests[0].resolve({
            data: {
              checkoutLinesUpdate: {
                checkout: null,
                errors: [{ code: 'UNAVAILABLE' }],
              },
            },
          });
        await rejected;
      });
      expect(store.cart).toBe(original);
      expect(store.cart?.lines[0].quantity).toBe(1);
    }
  );

  it('clears context and the cart cookie when clear returns null', async () => {
    const { result, store } = mount(checkout(1));
    act(() => result.current.context.setId('cart-1'));
    expect(document.cookie).toContain('review-test-cart=cart-1');
    let clear!: Promise<unknown>;
    await act(async () => {
      clear = result.current.clearCart();
    });
    await act(async () => {
      requests[0].resolve({
        data: { checkoutLinesClear: { checkout: null, errors: [] } },
      });
      await clear;
    });
    expect(store.cart).toBeNull();
    expect(result.current.context.cartKey).toBeNull();
    expect(result.current.context.cartId).toBeNull();
    expect(document.cookie).not.toContain('review-test-cart=');
  });
});

function withAddedLine() {
  const original = checkout(1);
  const firstLine = original.lines[0];
  return {
    ...original,
    totalQuantity: 2,
    lines: [
      ...original.lines,
      {
        ...firstLine,
        id: 'line-2',
        purchasableId: 'variant-2',
        purchasable: { ...firstLine.purchasable, id: 'variant-2' },
      },
    ],
  };
}

const snapshot = () =>
  mapShopanaCheckoutToEntityCart(checkout(1)).lines[0].purchasable;

describe('queued optimistic edits', () => {
  it.each(['network', 'userErrors'])(
    'keeps subsequent quantities visible after a %s failure',
    async (failure) => {
      const { result, store } = mount(checkout(1));
      let first!: Promise<unknown>;
      let second!: Promise<unknown>;
      let third!: Promise<unknown>;
      let rejected!: Promise<void>;
      await act(async () => {
        first = result.current.updateQuantity({
          cartItemId: 'line-1',
          quantity: 2,
        });
        rejected = expect(first).rejects.toBeDefined();
        second = result.current.updateQuantity({
          cartItemId: 'line-1',
          quantity: 3,
        });
      });
      expect(store.cart?.lines[0].quantity).toBe(3);
      await act(async () => {
        if (failure === 'network') requests[0].reject(new Error('offline'));
        else
          requests[0].resolve({
            data: {
              checkoutLinesUpdate: {
                checkout: null,
                errors: [{ code: 'UNAVAILABLE' }],
              },
            },
          });
        await rejected;
      });
      expect(store.cart?.lines[0].quantity).toBe(3);
      await act(async () => {
        third = result.current.updateQuantity({
          cartItemId: 'line-1',
          quantity: store.cart!.lines[0].quantity + 1,
        });
        requests[1].resolve({
          data: { checkoutLinesUpdate: { checkout: checkout(3), errors: [] } },
        });
        await second;
      });
      expect(store.cart?.lines[0].quantity).toBe(4);
      await act(async () => {
        requests[2].resolve({
          data: { checkoutLinesUpdate: { checkout: checkout(4), errors: [] } },
        });
        await third;
      });
      expect(store.cart?.lines[0].quantity).toBe(4);
    }
  );

  it('restores the last successful response when the final queued edit fails', async () => {
    const { result, store } = mount(checkout(1));
    let first!: Promise<unknown>;
    let second!: Promise<unknown>;
    let rejected!: Promise<void>;
    await act(async () => {
      first = result.current.updateQuantity({
        cartItemId: 'line-1',
        quantity: 2,
      });
      second = result.current.updateQuantity({
        cartItemId: 'line-1',
        quantity: 3,
      });
      rejected = expect(second).rejects.toBeDefined();
    });
    await act(async () => {
      requests[0].resolve({
        data: { checkoutLinesUpdate: { checkout: checkout(2), errors: [] } },
      });
      await first;
    });
    expect(store.cart?.lines[0].quantity).toBe(3);
    await act(async () => {
      requests[1].reject(new Error('offline'));
      await rejected;
    });
    expect(store.cart?.lines[0].quantity).toBe(2);
  });

  it.each(['update', 'remove', 'replace'] as const)(
    'uses the server line ID for a queued %s after adding a product',
    async (operation) => {
      const { result, store } = mount(checkout(1));
      let add!: Promise<unknown>;
      let next!: Promise<unknown>;
      await act(async () => {
        add = result.current.addToCart({
          purchasableId: 'variant-2',
          quantity: 1,
          purchasableSnapshot: snapshot(),
        });
      });
      const provisionalId = store.cart!.lines.find(
        (line) => line.purchasableId === 'variant-2'
      )!.id;
      expect(provisionalId).toMatch(/^client:checkoutLine:/);
      await act(async () => {
        if (operation === 'update')
          next = result.current.updateQuantity({
            cartItemId: provisionalId,
            quantity: 2,
          });
        else if (operation === 'remove')
          next = result.current.removeFromCart({ lineId: provisionalId });
        else
          next = result.current.replaceCartItem({
            lineId: provisionalId,
            purchasableId: 'variant-3',
            purchasableSnapshot: snapshot(),
          });
      });
      const added = withAddedLine();
      await act(async () => {
        requests[0].resolve({
          data: { checkoutLinesAdd: { checkout: added, errors: [] } },
        });
        await add;
      });
      const input = requests[1].variables.input;
      expect(
        operation === 'remove' ? input.lineIds?.[0] : input.lines?.[0].lineId
      ).toBe('line-2');
      if (operation === 'update')
        expect(
          store.cart?.lines.find((line) => line.id === 'line-2')?.quantity
        ).toBe(2);
      if (operation === 'remove')
        expect(store.cart?.lines.some((line) => line.id === 'line-2')).toBe(
          false
        );
      if (operation === 'replace')
        expect(
          store.cart?.lines.some((line) => line.purchasableId === 'variant-3')
        ).toBe(true);
      const field = {
        update: 'checkoutLinesUpdate',
        remove: 'checkoutLinesDelete',
        replace: 'checkoutLinesReplace',
      }[operation];
      await act(async () => {
        requests[1].resolve({
          data: { [field]: { checkout: added, errors: [] } },
        });
        await next;
      });
    }
  );

  it('replays additions before dependent updates when an earlier request fails', async () => {
    const { result, store } = mount(checkout(1));
    let failed!: Promise<unknown>;
    let add!: Promise<unknown>;
    let update!: Promise<unknown>;
    let rejected!: Promise<void>;
    await act(async () => {
      failed = result.current.updateQuantity({
        cartItemId: 'line-1',
        quantity: 2,
      });
      rejected = expect(failed).rejects.toBeDefined();
      add = result.current.addToCart({
        purchasableId: 'variant-2',
        quantity: 1,
        purchasableSnapshot: snapshot(),
      });
      const provisionalId = store.cart!.lines.find(
        (line) => line.purchasableId === 'variant-2'
      )!.id;
      update = result.current.updateQuantity({
        cartItemId: provisionalId,
        quantity: 2,
      });
    });
    await act(async () => {
      requests[0].reject(new Error('offline'));
      await rejected;
    });
    expect(
      store.cart?.lines.find((line) => line.purchasableId === 'variant-2')
        ?.quantity
    ).toBe(2);
    const added = withAddedLine();
    await act(async () => {
      requests[1].resolve({
        data: { checkoutLinesAdd: { checkout: added, errors: [] } },
      });
      await add;
    });
    expect(requests[2].variables.input.lines?.[0].lineId).toBe('line-2');
    expect(
      store.cart?.lines.find((line) => line.id === 'line-2')?.quantity
    ).toBe(2);
    await act(async () => {
      requests[2].resolve({
        data: { checkoutLinesUpdate: { checkout: added, errors: [] } },
      });
      await update;
    });
  });

  it('rejects dependent edits locally if the addition fails', async () => {
    const { result, store } = mount(checkout(1));
    let rejectedAdd!: Promise<void>;
    let rejectedUpdate!: Promise<void>;
    await act(async () => {
      const add = result.current.addToCart({
        purchasableId: 'variant-2',
        quantity: 1,
        purchasableSnapshot: snapshot(),
      });
      rejectedAdd = expect(add).rejects.toThrow('offline');
      const provisionalId = store.cart!.lines.find(
        (line) => line.purchasableId === 'variant-2'
      )!.id;
      const update = result.current.updateQuantity({
        cartItemId: provisionalId,
        quantity: 2,
      });
      rejectedUpdate = expect(update).rejects.toThrow(
        'Cart line is unavailable'
      );
    });
    await act(async () => {
      requests[0].reject(new Error('offline'));
      await rejectedAdd;
      await rejectedUpdate;
    });
    expect(requests).toHaveLength(1);
    expect(store.cart?.lines.map((line) => line.id)).toEqual(['line-1']);
  });
});

describe('loading the cart from the cookie', () => {
  function mountFromCookie() {
    document.cookie = 'review-test-cart=cart-1; Path=/';
    const store = createCartStoreZustand(null);
    return renderHook(
      () => ({ context: useCartContext(), ...useAddItemToCart() }),
      {
        wrapper: ({ children }) => (
          <CartProvider store={store} config={config}>
            {children}
          </CartProvider>
        ),
      }
    );
  }

  it('SC-iv69: keeps the cart, its cookie and a retry when loading fails with a network error', async () => {
    const refetch = vi.fn(async () => undefined);
    const failure = new Error('Failed to fetch');
    cartQuery.current = {
      loading: false,
      data: undefined,
      error: failure,
      refetch,
    };
    const { result } = mountFromCookie();
    expect(document.cookie).toContain('review-test-cart=cart-1');
    expect(result.current.context.cartId).toBe('cart-1');
    expect(result.current.context.isCartLoaded).toBe(false);
    expect(result.current.context.cartError).toBe(failure);
    await act(async () => {
      await result.current.context.retryCart();
    });
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('SC-iv69: adds a line to the cart that failed to load instead of creating a new one', async () => {
    cartQuery.current = {
      loading: false,
      data: undefined,
      error: new Error('Failed to fetch'),
    };
    const { result } = mountFromCookie();
    let added!: Promise<unknown>;
    await act(async () => {
      added = result.current.addToCart({
        purchasableId: 'variant-1',
        quantity: 1,
        purchasableSnapshot: {
          price: { amount: 10, currencyCode: 'USD' },
        },
      } as Parameters<typeof result.current.addToCart>[0]);
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].document).toBe(addToCartMutation);
    expect(requests[0].variables.input.checkoutId).toBe('cart-1');
    await act(async () => {
      requests[0].resolve({
        data: { checkoutLinesAdd: { checkout: checkout(1), errors: [] } },
      });
      await added;
    });
    expect(result.current.context.cartId).toBe('cart-1');
  });

  it('SC-iv69: drops the cart cookie only when the server says the cart does not exist', () => {
    cartQuery.current = {
      loading: false,
      data: undefined,
      error: new CombinedGraphQLErrors({
        errors: [{ message: 'Not found', extensions: { code: 'NOT_FOUND' } }],
      }),
    };
    const { result } = mountFromCookie();
    expect(document.cookie).not.toContain('review-test-cart=cart-1');
    expect(result.current.context.cartId).toBeNull();
    expect(result.current.context.cartError).toBeNull();
  });
});
