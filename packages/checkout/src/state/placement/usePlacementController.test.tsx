import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlacementController } from '#checkout/state/placement/usePlacementController';
import { usePlacementStore } from '#checkout/state/placement/placementStore';
import { attemptStorageKey } from '#checkout/state/placement/attemptJournal';
import type { PlacementAttempt } from '#checkout/state/placement/attemptJournal';
import {
  CheckoutEvent,
  emitCheckoutEvent,
  onCheckoutEvent,
} from '#checkout/state/checkoutBus';
import type { PlacementResult } from '#checkout/state/placement/types';
import {
  graphQLErrorPlacement,
  PlacementUnconfirmedError,
} from '#checkout/state/placement/outcome';

const mocks = vi.hoisted(() => ({
  submitCheckout: vi.fn(),
  readPlacement: vi.fn(),
  refetch: vi.fn(),
  checkoutData: {
    checkout: null as
      | ({ id: string; resultRevision: string } & Record<string, unknown>)
      | null,
    loaded: true,
  },
}));

vi.mock('#checkout/context/CheckoutApiContext', () => ({
  useCheckoutApi: () => ({ submitCheckout: mocks.submitCheckout }),
}));
// By default the checkout is unreadable, as after it became an order (decision 1.2).
vi.mock('#checkout/context/CheckoutDataContext', () => ({
  useCheckoutData: () => ({ refetch: mocks.refetch, ...mocks.checkoutData }),
}));
vi.mock('#checkout/theme', () => ({
  useCheckoutTheme: () => ({ useCheckoutReturnPath: () => '/checkout/return' }),
}));
vi.mock('#checkout/state/placement/recovery', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('#checkout/state/placement/recovery')
  >()),
  useReadPlacement: () => mocks.readPlacement,
}));

const sentAttempt: PlacementAttempt = {
  checkoutId: 'checkout-1',
  idempotencyKey: 'key-1',
  returnUrl: 'https://shop.example/checkout/return?checkout=checkout-1',
  resultRevision: 'rev-1',
  paymentFlow: 'ONLINE',
  state: 'sent',
  placementId: null,
  placementToken: null,
  orderId: null,
  lastStatus: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const paid: PlacementResult = {
  placementId: 'placement-1',
  placementToken: null,
  placementState: 'PLACED',
  paymentFlow: null,
  checkoutId: 'checkout-1',
  resultRevision: 'rev-1',
  orderId: 'order-1',
  orderNumber: null,
  status: 'PAID',
  customerAction: null,
  paymentFailure: null,
  userErrors: [],
};

const redirect: PlacementResult = {
  ...paid,
  status: 'REQUIRES_ACTION',
  customerAction: {
    type: 'REDIRECT',
    url: 'https://pay.example',
    title: null,
    instructions: null,
    expiresAt: null,
    sdk: null,
    params: null,
    data: null,
  },
};

function storeAttempt(attempt: PlacementAttempt) {
  window.localStorage.setItem(
    attemptStorageKey(attempt.checkoutId),
    JSON.stringify(attempt)
  );
}

function storedAttempt(checkoutId = 'checkout-1'): PlacementAttempt | null {
  const raw = window.localStorage.getItem(attemptStorageKey(checkoutId));
  return raw ? (JSON.parse(raw) as PlacementAttempt) : null;
}

describe('usePlacementController', () => {
  beforeEach(() => {
    storeAttempt(sentAttempt);
    mocks.checkoutData = { checkout: null, loaded: true };
    usePlacementStore.getState().reset();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('resends an unanswered attempt from the journal without the checkout', async () => {
    mocks.submitCheckout.mockResolvedValue(paid);
    const accepted = vi.fn();
    const off = onCheckoutEvent(CheckoutEvent.OrderAccepted, accepted);

    renderHook(() => usePlacementController('checkout-1'));

    await waitFor(() =>
      expect(usePlacementStore.getState().phase).toEqual({
        name: 'accepted',
        orderId: 'order-1',
        orderNumber: null,
        status: 'PAID',
      })
    );
    expect(mocks.submitCheckout).toHaveBeenCalledWith({
      checkoutId: 'checkout-1',
      idempotencyKey: 'key-1',
      returnUrl: sentAttempt.returnUrl,
    });
    expect(accepted).toHaveBeenCalledWith({
      checkoutId: 'checkout-1',
      orderId: 'order-1',
      orderNumber: null,
      status: 'PAID',
    });
    expect(storedAttempt()).toBeNull();
    off();
  });

  it('drops an answer that arrives after unmount', async () => {
    let answer: (result: PlacementResult) => void = () => undefined;
    mocks.submitCheckout.mockReturnValue(
      new Promise<PlacementResult>((resolve) => {
        answer = resolve;
      })
    );
    const accepted = vi.fn();
    const off = onCheckoutEvent(CheckoutEvent.OrderAccepted, accepted);

    const { unmount } = renderHook(() => usePlacementController('checkout-1'));
    await waitFor(() => expect(mocks.submitCheckout).toHaveBeenCalled());
    unmount();
    usePlacementStore.getState().reset();
    await act(async () => {
      answer(redirect);
    });

    expect(usePlacementStore.getState().phase).toEqual({ name: 'idle' });
    expect(accepted).not.toHaveBeenCalled();
    expect(storedAttempt()).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'sent',
    });
    off();
  });

  it('drops an answer for the previous checkout after the cart switched', async () => {
    let answer: (result: PlacementResult) => void = () => undefined;
    mocks.submitCheckout.mockReturnValue(
      new Promise<PlacementResult>((resolve) => {
        answer = resolve;
      })
    );
    const accepted = vi.fn();
    const off = onCheckoutEvent(CheckoutEvent.OrderAccepted, accepted);

    const { rerender } = renderHook(({ id }) => usePlacementController(id), {
      initialProps: { id: 'checkout-1' },
    });
    await waitFor(() => expect(mocks.submitCheckout).toHaveBeenCalled());
    rerender({ id: 'checkout-2' });
    expect(usePlacementStore.getState().phase).toEqual({ name: 'idle' });

    await act(async () => {
      answer(paid);
    });

    expect(usePlacementStore.getState().phase).toEqual({ name: 'idle' });
    expect(accepted).not.toHaveBeenCalled();
    // The previous checkout keeps its attempt: it is resent with the same key when reopened.
    expect(storedAttempt()).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'sent',
    });
    off();
  });

  it('offers a resumed redirect instead of leaving the page', async () => {
    mocks.submitCheckout.mockResolvedValue(redirect);
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });

    renderHook(() => usePlacementController('checkout-1'));

    await waitFor(() =>
      expect(usePlacementStore.getState().phase).toEqual({
        name: 'payment-incomplete',
        url: 'https://pay.example',
      })
    );
    expect(assign).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('waits for the checkout before resending', async () => {
    mocks.submitCheckout.mockResolvedValue(paid);
    mocks.checkoutData = { checkout: null, loaded: false };
    const { rerender } = renderHook(() => usePlacementController('checkout-1'));
    expect(mocks.submitCheckout).not.toHaveBeenCalled();

    mocks.checkoutData = {
      checkout: { id: 'checkout-1', resultRevision: 'rev-1' },
      loaded: true,
    };
    rerender();
    await waitFor(() => expect(mocks.submitCheckout).toHaveBeenCalledTimes(1));
  });

  it('does not resend an unanswered attempt after the cart changed', async () => {
    mocks.checkoutData = {
      checkout: { id: 'checkout-1', resultRevision: 'rev-2' },
      loaded: true,
    };
    renderHook(() => usePlacementController('checkout-1'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.submitCheckout).not.toHaveBeenCalled();
    expect(usePlacementStore.getState().phase).toEqual({ name: 'idle' });
  });

  it('closes the attempt when the API answers with a GraphQL error', async () => {
    mocks.submitCheckout.mockResolvedValue(
      graphQLErrorPlacement('checkout-1', [
        { message: 'Forbidden', extensions: { code: 'FORBIDDEN' } },
      ])
    );

    renderHook(() => usePlacementController('checkout-1'));

    await waitFor(() =>
      expect(usePlacementStore.getState().phase).toEqual({
        name: 'rejected',
        code: 'FORBIDDEN',
      })
    );
    expect(storedAttempt()).toBeNull();
  });

  it('SC-mdfw: a choice gone stale keeps the checkout open and reads it again', async () => {
    mocks.refetch.mockResolvedValue(undefined);
    mocks.submitCheckout.mockResolvedValue({
      ...paid,
      placementId: null,
      placementState: null,
      orderId: null,
      status: null,
      userErrors: [
        {
          code: 'CHECKOUT_OPEN',
          field: ['input', 'checkoutId'],
          message: 'The checkout changed.',
          retryable: false,
        },
      ],
    });

    renderHook(() => usePlacementController('checkout-1'));

    await waitFor(() =>
      expect(usePlacementStore.getState().phase).toEqual({
        name: 'rejected',
        code: 'CHECKOUT_OPEN',
      })
    );
    // No placement was made: the next press takes a new key with the new choice.
    expect(storedAttempt()).toBeNull();
    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the key when the outcome of the request is unknown', async () => {
    mocks.submitCheckout.mockRejectedValue(new PlacementUnconfirmedError());

    renderHook(() => usePlacementController('checkout-1'));

    await waitFor(() =>
      expect(usePlacementStore.getState().phase).toEqual({
        name: 'rejected',
        code: 'PLACEMENT_UNCONFIRMED',
      })
    );
    expect(storedAttempt()).toMatchObject({
      idempotencyKey: 'key-1',
      state: 'sent',
    });
  });

  describe('a lost answer when the checkout is no longer ready', () => {
    const placedCheckout = (resultRevision: string) => ({
      id: 'checkout-1',
      resultRevision,
      status: 'PLACED',
      valid: true,
      expiresAt: new Date(Date.now() + 60_000),
      issues: [],
      payment: { selection: { method: { flow: 'ONLINE' } } },
    });

    it('resends the unanswered attempt on submit with its key', async () => {
      mocks.submitCheckout.mockResolvedValue(paid);
      // Loaded with the same snapshot: the reload resends it first and the order is accepted.
      mocks.checkoutData = { checkout: placedCheckout('rev-1'), loaded: true };
      renderHook(() => usePlacementController('checkout-1'));
      await waitFor(() =>
        expect(usePlacementStore.getState().phase).toMatchObject({
          name: 'accepted',
        })
      );
      mocks.submitCheckout.mockClear();
      usePlacementStore.getState().reset();
      storeAttempt(sentAttempt);

      await act(async () => {
        await emitCheckoutEvent(CheckoutEvent.SubmitReady, { payload: {} });
      });

      await waitFor(() =>
        expect(mocks.submitCheckout).toHaveBeenCalledWith({
          checkoutId: 'checkout-1',
          idempotencyKey: 'key-1',
          returnUrl: sentAttempt.returnUrl,
        })
      );
    });

    it('does not place a changed snapshot that is not ready', async () => {
      mocks.checkoutData = { checkout: placedCheckout('rev-2'), loaded: true };
      renderHook(() => usePlacementController('checkout-1'));

      await act(async () => {
        await emitCheckoutEvent(CheckoutEvent.SubmitReady, { payload: {} });
      });

      expect(mocks.submitCheckout).not.toHaveBeenCalled();
    });

    it('follows CHECKOUT_ALREADY_PLACED by resending the unanswered attempt', async () => {
      mocks.submitCheckout.mockResolvedValue(paid);
      // Still loading: the reload resend waits for the checkout.
      mocks.checkoutData = { checkout: null, loaded: false };
      renderHook(() => usePlacementController('checkout-1'));
      expect(mocks.submitCheckout).not.toHaveBeenCalled();

      await act(async () => {
        await emitCheckoutEvent(CheckoutEvent.CheckoutClosed, {
          code: 'CHECKOUT_ALREADY_PLACED',
        });
      });

      await waitFor(() =>
        expect(usePlacementStore.getState().phase).toMatchObject({
          name: 'accepted',
        })
      );
      expect(mocks.submitCheckout).toHaveBeenCalledTimes(1);
      expect(mocks.submitCheckout).toHaveBeenCalledWith(
        expect.objectContaining({ idempotencyKey: 'key-1' })
      );
    });
  });
});
