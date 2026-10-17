import { describe, expect, it, vi } from 'vitest';
import {
  buildReturnUrl,
  pollPlacement,
  readReturnParams,
  resolveRecoveryLocator,
  stripReturnToken,
} from '#checkout/state/placement/recovery';
import type { PlacementAttempt } from '#checkout/state/placement/attemptJournal';
import type { PlacementResult } from '#checkout/state/placement/types';

const base: PlacementResult = {
  placementId: 'placement-1',
  placementToken: null,
  placementState: 'PLACED',
  checkoutId: 'checkout-1',
  resultRevision: 'rev-1',
  orderId: 'order-1',
  status: 'PAYMENT_PENDING',
  customerAction: null,
  paymentFailure: null,
  userErrors: [],
};

const attempt: PlacementAttempt = {
  checkoutId: 'checkout-1',
  idempotencyKey: 'key-1',
  returnUrl: 'https://shop.example/uk/checkout/return?checkout=checkout-1',
  resultRevision: 'rev-1',
  paymentFlow: 'ONLINE',
  state: 'resolved',
  placementId: 'from-journal',
  placementToken: null,
  orderId: null,
  lastStatus: 'REQUIRES_ACTION',
  createdAt: 1,
  updatedAt: 1,
};

describe('return URL', () => {
  it('names the checkout on the theme return path', () => {
    expect(
      buildReturnUrl('https://shop.example', '/uk/checkout/return', 'Z2lkOi8v/1')
    ).toBe('https://shop.example/uk/checkout/return?checkout=Z2lkOi8v%2F1');
  });

  it('reads the placement from the URL first', () => {
    const params = readReturnParams('?checkout=checkout-1&placement=p-9&token=t-9');
    expect(params).toEqual({
      checkoutId: 'checkout-1',
      locator: { placementId: 'p-9', placementToken: 't-9' },
    });
    expect(resolveRecoveryLocator(params, attempt)).toEqual({
      placementId: 'p-9',
      placementToken: 't-9',
    });
  });

  it('falls back to the journal before B4', () => {
    expect(resolveRecoveryLocator(readReturnParams('?checkout=checkout-1'), attempt)).toEqual({
      placementId: 'from-journal',
      placementToken: null,
    });
  });

  it('removes the token from the address bar', () => {
    const replaceState = vi.fn();
    stripReturnToken(
      { href: 'https://shop.example/checkout/return?placement=p&token=secret' } as Location,
      { state: null, replaceState } as unknown as History
    );
    expect(replaceState).toHaveBeenCalledWith(
      null,
      '',
      'https://shop.example/checkout/return?placement=p'
    );
  });
});

describe('pollPlacement', () => {
  const locator = { placementId: 'placement-1', placementToken: null };

  it('polls with backoff until the payment settles', async () => {
    const read = vi
      .fn()
      .mockResolvedValueOnce(base)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ ...base, status: 'PAID' });
    const waits: number[] = [];
    const outcomes: string[] = [];
    await pollPlacement({
      read,
      locator,
      flow: 'ONLINE',
      signal: new AbortController().signal,
      onResult: (_result, outcome) => outcomes.push(outcome.kind),
      onMissing: () => outcomes.push('missing'),
      wait: async (ms) => void waits.push(ms),
    });
    expect(outcomes).toEqual(['awaiting-payment', 'accepted']);
    expect(waits).toEqual([2000, 4000]);
  });

  it('stops when the placement cannot be read', async () => {
    const onMissing = vi.fn();
    await pollPlacement({
      read: vi.fn().mockResolvedValue(null),
      locator,
      flow: 'ONLINE',
      signal: new AbortController().signal,
      onResult: vi.fn(),
      onMissing,
      wait: async () => undefined,
    });
    expect(onMissing).toHaveBeenCalledOnce();
  });

  it('stops when aborted', async () => {
    const controller = new AbortController();
    const read = vi.fn().mockResolvedValue(base);
    await pollPlacement({
      read,
      locator,
      flow: 'ONLINE',
      signal: controller.signal,
      onResult: () => controller.abort(),
      onMissing: vi.fn(),
      wait: async () => undefined,
    });
    expect(read).toHaveBeenCalledOnce();
  });
});
