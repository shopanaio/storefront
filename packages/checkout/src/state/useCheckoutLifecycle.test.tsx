import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCheckoutLifecycle } from '#checkout/state/useCheckoutLifecycle';
import { useRenewalStore } from '#checkout/state/renewal';
import { usePlacementStore } from '#checkout/state/placement/placementStore';
import { attemptStorageKey } from '#checkout/state/placement/attemptJournal';
import {
  CheckoutEvent,
  emitCheckoutEvent,
  onCheckoutEvent,
} from '#checkout/state/checkoutBus';

const mocks = vi.hoisted(() => ({
  createCart: vi.fn(),
  refetch: vi.fn(),
  checkout: null as Record<string, unknown> | null,
}));

vi.mock(
  '@shopana/storefront-sdk/modules/cart/react/hooks/useCreateCart',
  () => ({
    default: () => ({ createCart: mocks.createCart }),
  })
);
vi.mock('#checkout/context/CheckoutDataContext', () => ({
  useCheckoutData: () => ({ checkout: mocks.checkout, refetch: mocks.refetch }),
}));

const NOW = new Date('2026-10-18T12:00:00Z').getTime();

const checkout = (patch: Record<string, unknown> = {}) => ({
  id: 'checkout-1',
  status: 'READY',
  expiresAt: new Date(NOW + 60_000),
  currencyCode: 'UAH',
  localeCode: 'uk',
  lines: [],
  ...patch,
});

describe('useCheckoutLifecycle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    mocks.createCart.mockResolvedValue({ id: 'checkout-2' });
    mocks.refetch.mockResolvedValue(undefined);
    usePlacementStore.getState().reset();
    useRenewalStore.setState({ state: 'idle', retry: null });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('replaces a checkout the server reports expired', async () => {
    mocks.checkout = checkout({
      status: 'EXPIRED',
      expiresAt: new Date(NOW - 1),
    });
    renderHook(() => useCheckoutLifecycle('checkout-1'));
    await act(async () => undefined);
    expect(mocks.createCart).toHaveBeenCalledTimes(1);
    expect(useRenewalStore.getState().state).toBe('renewed');
  });

  it('SC-3ffz: reads the checkout again at expiresAt and keeps it while the server keeps it open', async () => {
    mocks.checkout = checkout();
    renderHook(() => useCheckoutLifecycle('checkout-1'));

    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(mocks.refetch).toHaveBeenCalledTimes(1);

    // The browser clock runs an hour ahead; the server still keeps the checkout open.
    await act(async () => {
      vi.advanceTimersByTime(60 * 60 * 1000);
    });
    expect(mocks.createCart).not.toHaveBeenCalled();
  });

  it('replaces the checkout when a mutation finds it expired', async () => {
    mocks.checkout = checkout();
    renderHook(() => useCheckoutLifecycle('checkout-1'));
    await act(async () => {
      await emitCheckoutEvent(CheckoutEvent.CheckoutClosed, {
        code: 'CHECKOUT_EXPIRED',
      });
    });
    expect(mocks.createCart).toHaveBeenCalledTimes(1);
  });

  it('keeps the checkout while a placement attempt of this browser owns it', async () => {
    window.localStorage.setItem(
      attemptStorageKey('checkout-1'),
      JSON.stringify({
        checkoutId: 'checkout-1',
        idempotencyKey: 'key-1',
        expectedTotal: { amount: '1000', currencyCode: 'UAH' },
        returnUrl: 'https://shop.example/checkout/return?checkout=checkout-1',
        resultRevision: 'rev-1',
        paymentFlow: 'ONLINE',
        state: 'resolved',
        placementId: 'placement-1',
        placementToken: null,
        orderId: null,
        lastStatus: 'REQUIRES_ACTION',
        createdAt: NOW,
        updatedAt: NOW,
      })
    );
    mocks.checkout = checkout({
      status: 'EXPIRED',
      expiresAt: new Date(NOW - 1),
    });
    renderHook(() => useCheckoutLifecycle('checkout-1'));
    await act(async () => undefined);
    expect(mocks.createCart).not.toHaveBeenCalled();
  });

  it('hands a placed checkout to the placement controller', async () => {
    const closed = vi.fn();
    const off = onCheckoutEvent(CheckoutEvent.CheckoutClosed, closed);
    mocks.checkout = checkout({ status: 'PLACED' });
    renderHook(() => useCheckoutLifecycle('checkout-1'));
    await act(async () => undefined);
    expect(closed).toHaveBeenCalledWith({ code: 'CHECKOUT_ALREADY_PLACED' });
    expect(mocks.createCart).not.toHaveBeenCalled();
    off();
  });
});
