import { act, renderHook } from '@testing-library/react';
import type { TypedDocumentNode } from '@apollo/client';
import {
  createCartMutationQueue,
  followSuperseded,
} from '@shopana/storefront-sdk/modules/cart/core/utils/mutationQueue';
import { updateCustomerNoteMutation } from '#checkout/api/mutations/updateCustomerNoteMutation.shopana';
import { submitCheckoutMutation } from '#checkout/api/mutations/submitCheckoutMutation.shopana';
import { registerPendingInput } from '#checkout/state/pendingInputs';
import { INPUT_UNSAVED_CODE } from '#checkout/state/placement/outcome';
import { useCreateCheckoutApi } from './useCreateCheckoutApi';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  queue: null as ReturnType<typeof createCartMutationQueue> | null,
}));

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));
vi.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ readQuery: () => null }),
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
