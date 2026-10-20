import { act, renderHook } from '@testing-library/react';
import type { TypedDocumentNode } from '@apollo/client';
import {
  createCartMutationQueue,
  followSuperseded,
} from '@shopana/storefront-sdk/modules/cart/core/utils/mutationQueue';
import { updateCustomerNoteMutation } from '#checkout/api/mutations/updateCustomerNoteMutation.shopana';
import { submitCheckoutMutation } from '#checkout/api/mutations/submitCheckoutMutation.shopana';
import { registerPendingInput } from '#checkout/state/pendingInputs';
import { updateLoyaltyRedemptionMutation } from '#checkout/api/mutations/updateLoyaltyRedemptionMutation.shopana';
import { removeLoyaltyRedemptionMutation } from '#checkout/api/mutations/removeLoyaltyRedemptionMutation.shopana';
import { addPromoCodeMutation } from '#checkout/api/mutations/addPromoCodeMutation.shopana';
import { removePromoCodeMutation } from '#checkout/api/mutations/removePromoCodeMutation.shopana';
import {
  INPUT_UNSAVED_CODE,
  LOYALTY_QUOTE_CHANGED_CODE,
} from '#checkout/state/placement/outcome';
import type { Checkout } from '#checkout/types/entity';
import { useCreateCheckoutApi } from './useCreateCheckoutApi';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  queue: null as ReturnType<typeof createCartMutationQueue> | null,
  /** The checkout the last answer left in the cache; `null`: nothing cached. */
  cached: null as unknown,
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({
    readQuery: () => (mocks.cached ? { checkout: mocks.cached } : null),
    refetchQueries: () => Promise.resolve([]),
  }),
}));
// The cache holds the checkout entity as is in these tests.
vi.mock('#checkout/hooks/useCheckout/mapApiCheckoutToCheckout', () => ({
  mapApiCheckoutToCheckout: (checkout: unknown) => checkout,
}));
vi.mock('#checkout/context/CheckoutDataContext', () => ({
  useCheckoutData: () => ({
    checkout: { id: 'c1', updatedAt: new Date('2026-10-19T10:00:00Z') },
  }),
}));
vi.mock(
  '@shopana/storefront-sdk/modules/cart/react/context/CartContext',
  () => ({
    useCartSetters: () => ({
      enqueueMutation: (
        operation: () => Promise<unknown>,
        options?: { key?: string }
      ) => mocks.queue!.run(operation, options),
      waitForMutations: () => mocks.queue!.idle(),
    }),
  })
);
// Every mutation goes through the real queue; `mocks.send` answers it.
vi.mock('#checkout/api/useCheckoutOperation', () => ({
  useCheckoutOperation: (mutation: TypedDocumentNode) => ({
    commit: (
      variables: unknown,
      { key, superseded = 'follow' }: { key?: string; superseded?: string } = {}
    ) => {
      const queued = mocks.queue!.run(() => mocks.send(mutation, variables), {
        key,
      });
      return superseded === 'follow' ? followSuperseded(queued) : queued;
    },
    send: (variables: unknown) => mocks.send(mutation, variables),
  }),
}));

const placed = {
  placeOrder: {
    placementId: 'p1',
    placementToken: 't1',
    placementState: 'COMPLETED',
    checkoutId: 'c1',
    resultRevision: 'r1',
    orderId: 'o1',
    orderNumber: '1001',
    status: 'PAYMENT_NOT_REQUIRED',
    paymentFlow: null,
    customerAction: null,
    paymentFailure: null,
    userErrors: [],
  },
};
const submitInput = {
  checkoutId: 'c1',
  idempotencyKey: 'k1',
  expectedTotal: { amount: '1000', currencyCode: 'UAH' as const },
  returnUrl: 'https://shop/r',
};
const placeOrderCalls = () =>
  mocks.send.mock.calls.filter(
    ([mutation]) => mutation === submitCheckoutMutation
  );

describe('useCreateCheckoutApi.submitCheckout', () => {
  beforeEach(() => {
    mocks.queue = createCartMutationQueue(() => undefined);
    mocks.send.mockReset();
  });

  it('BR-awbl: does not place the order while the latest save of the note failed', async () => {
    mocks.send.mockImplementation(async (mutation) => {
      if (mutation === updateCustomerNoteMutation) throw new Error('offline');
      return placed;
    });
    const { result } = renderHook(() => useCreateCheckoutApi());

    await act(async () => {
      await result.current
        .updateCustomerNote({ note: 'ring twice' })
        .catch(() => undefined);
    });
    let placement!: Awaited<ReturnType<typeof result.current.submitCheckout>>;
    await act(async () => {
      placement = await result.current.submitCheckout(submitInput);
    });

    expect(placeOrderCalls()).toHaveLength(0);
    expect(placement.userErrors[0]?.code).toBe(INPUT_UNSAVED_CODE);
  });

  it('BR-awbl: places the order once the note got through', async () => {
    mocks.send
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(placed);
    const { result } = renderHook(() => useCreateCheckoutApi());

    await act(async () => {
      await result.current
        .updateCustomerNote({ note: 'ring' })
        .catch(() => undefined);
      await result.current.updateCustomerNote({ note: 'ring twice' });
    });
    await act(async () => {
      await result.current.submitCheckout(submitInput);
    });

    expect(placeOrderCalls()).toHaveLength(1);
  });

  it('BR-awbl: sends held-back input first and waits for its save', async () => {
    const order: string[] = [];
    mocks.send.mockImplementation(async (mutation) => {
      order.push(mutation === submitCheckoutMutation ? 'placeOrder' : 'note');
      return placed;
    });
    const { result } = renderHook(() => useCreateCheckoutApi());
    const unregister = registerPendingInput(() =>
      result.current.updateCustomerNote({ note: 'typed just now' })
    );

    await act(async () => {
      await result.current.submitCheckout(submitInput);
    });
    unregister();

    expect(order).toEqual(['note', 'placeOrder']);
  });
});

const uah = (amount: number) => ({ amount, currencyCode: 'UAH' });
const loyaltyCheckout = (
  overrides: Partial<Checkout.Checkout> = {}
): Checkout.Checkout =>
  ({
    id: 'c1',
    updatedAt: new Date('2026-10-20T10:00:00Z'),
    promoCodes: [],
    loyaltyRedemption: null,
    loyaltyRewardId: null,
    loyaltySelection: null,
    ...overrides,
  }) as unknown as Checkout.Checkout;
const loyaltyCalls = () =>
  mocks.send.mock.calls
    .filter(([mutation]) =>
      [
        updateLoyaltyRedemptionMutation,
        removeLoyaltyRedemptionMutation,
        addPromoCodeMutation,
        removePromoCodeMutation,
      ].includes(mutation)
    )
    .map(([mutation, variables]) => ({
      mutation:
        mutation === updateLoyaltyRedemptionMutation
          ? 'update'
          : mutation === removeLoyaltyRedemptionMutation
            ? 'remove'
            : mutation === addPromoCodeMutation
              ? 'addPromo'
              : 'removePromo',
      input: (variables as { input: Record<string, unknown> }).input,
    }));
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe('useCreateCheckoutApi loyalty', () => {
  beforeEach(() => {
    mocks.queue = createCartMutationQueue(() => undefined);
    mocks.send.mockReset().mockResolvedValue(placed);
    mocks.cached = null;
  });
  afterEach(() => {
    mocks.cached = null;
  });

  it('K1: removes the selection whenever nothing stays chosen', async () => {
    mocks.cached = loyaltyCheckout();
    const { result } = renderHook(() => useCreateCheckoutApi());

    await act(async () => {
      await result.current.setLoyaltyRedemption(null);
    });

    expect(loyaltyCalls()).toEqual([{ mutation: 'remove', input: { checkoutId: 'c1' } }]);
  });

  it('K2: "retry" sends the saved choice that the calculation did not apply', async () => {
    mocks.cached = loyaltyCheckout({
      loyaltySelection: { source: 'POINTS', points: '300', amount: null, rewardId: 'r1' },
    });
    const { result } = renderHook(() => useCreateCheckoutApi());

    await act(async () => {
      await result.current.refreshLoyalty();
    });

    expect(loyaltyCalls()).toEqual([
      {
        mutation: 'update',
        input: { checkoutId: 'c1', source: 'POINTS', points: '300', amount: null, rewardId: 'r1' },
      },
    ]);
  });

  it('K3: a reward keeps the points that the order is too small for', async () => {
    mocks.cached = loyaltyCheckout({
      loyaltySelection: { source: 'POINTS', points: null, amount: null, rewardId: null },
    });
    const { result } = renderHook(() => useCreateCheckoutApi());

    await act(async () => {
      await result.current.setLoyaltyReward({ id: 'r1', voucherCode: null });
    });

    expect(loyaltyCalls()).toEqual([
      {
        mutation: 'update',
        input: { checkoutId: 'c1', source: 'POINTS', points: null, amount: null, rewardId: 'r1' },
      },
    ]);
  });

  it('V1: a waiting reward is sent with the source chosen after it', async () => {
    mocks.cached = loyaltyCheckout();
    const gate = deferred();
    mocks.send.mockImplementationOnce(async () => {
      await gate.promise;
      return placed;
    });
    const { result } = renderHook(() => useCreateCheckoutApi());

    let writes!: Promise<unknown>;
    await act(async () => {
      writes = Promise.all([
        result.current.setLoyaltyRedemption({ source: 'POINTS', points: null }),
        result.current.setLoyaltyReward({ id: 'r1', voucherCode: null }),
        result.current.setLoyaltyRedemption({ source: 'STORE_CREDIT', amount: '80' }),
      ]);
      gate.resolve();
      await writes;
    });

    expect(loyaltyCalls().map(({ input }) => input)).toEqual([
      { checkoutId: 'c1', source: 'POINTS', points: null, amount: null, rewardId: null },
      { checkoutId: 'c1', source: 'STORE_CREDIT', points: null, amount: '80', rewardId: 'r1' },
    ]);
  });

  it('V1: a refresh never replaces a waiting choice of the buyer', async () => {
    mocks.cached = loyaltyCheckout({
      loyaltySelection: { source: 'POINTS', points: '300', amount: null, rewardId: null },
    });
    const gate = deferred();
    mocks.send.mockImplementationOnce(async () => {
      await gate.promise;
      return placed;
    });
    const { result } = renderHook(() => useCreateCheckoutApi());

    await act(async () => {
      const writes = Promise.all([
        result.current.refreshLoyalty(),
        result.current.setLoyaltyRedemption(null),
        result.current.refreshLoyalty(),
      ]);
      gate.resolve();
      await writes;
    });

    expect(loyaltyCalls().map(({ mutation }) => mutation)).toEqual([
      'update',
      'remove',
      'update',
    ]);
  });

  it('S5: takes the voucher code back when the reward was not saved', async () => {
    mocks.cached = loyaltyCheckout();
    mocks.send.mockImplementation(async (mutation) => {
      if (mutation === updateLoyaltyRedemptionMutation) throw new Error('offline');
      return placed;
    });
    const { result } = renderHook(() => useCreateCheckoutApi());

    await act(async () => {
      await result.current
        .setLoyaltyReward({ id: 'r1', voucherCode: 'GIFT-1' })
        .catch(() => undefined);
    });

    expect(loyaltyCalls()).toEqual([
      { mutation: 'addPromo', input: { checkoutId: 'c1', code: 'GIFT-1' } },
      {
        mutation: 'update',
        input: { checkoutId: 'c1', source: null, points: null, amount: null, rewardId: 'r1' },
      },
      { mutation: 'removePromo', input: { checkoutId: 'c1', code: 'GIFT-1' } },
    ]);
  });

  it('S7: does not place the order when the renewed quote pays a different amount', async () => {
    const quote = (amount: number, expiresAt: Date) =>
      ({
        source: 'POINTS',
        requestedPoints: null,
        requestedAmount: null,
        points: String(amount * 10),
        availablePoints: '1000',
        availableAmount: uah(100),
        discount: uah(amount),
        expiresAt,
      }) as Checkout.LoyaltyRedemption;
    mocks.cached = loyaltyCheckout({
      loyaltyRedemption: quote(50, new Date(Date.now() + 10_000)),
      loyaltySelection: { source: 'POINTS', points: null, amount: null, rewardId: null },
    });
    mocks.send.mockImplementation(async (mutation) => {
      if (mutation === updateLoyaltyRedemptionMutation) {
        // The balance changed meanwhile: the renewed quote pays less.
        mocks.cached = loyaltyCheckout({
          updatedAt: new Date('2026-10-20T10:01:00Z'),
          loyaltyRedemption: quote(40, new Date(Date.now() + 600_000)),
          loyaltySelection: { source: 'POINTS', points: null, amount: null, rewardId: null },
        });
      }
      return placed;
    });
    const { result } = renderHook(() => useCreateCheckoutApi());

    let placement!: Awaited<ReturnType<typeof result.current.submitCheckout>>;
    await act(async () => {
      placement = await result.current.submitCheckout(submitInput);
    });

    expect(loyaltyCalls().map(({ mutation }) => mutation)).toEqual(['update']);
    expect(placeOrderCalls()).toHaveLength(0);
    expect(placement.userErrors[0]?.code).toBe(LOYALTY_QUOTE_CHANGED_CODE);
  });
});
