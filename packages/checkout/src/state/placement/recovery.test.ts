import { CombinedGraphQLErrors } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  buildReturnUrl,
  pollPlacement,
  readReturnParams,
  resolveRecoveryLocator,
  stripReturnToken,
  useReadPlacement,
} from '#checkout/state/placement/recovery';
import type { PlacementAttempt } from '#checkout/state/placement/attemptJournal';
import type { PlacementResult } from '#checkout/state/placement/types';

const apollo = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('@apollo/client/react', () => ({ useApolloClient: () => apollo }));

const base: PlacementResult = {
  placementId: 'placement-1',
  placementToken: null,
  placementState: 'PLACED',
  paymentFlow: null,
  checkoutId: 'checkout-1',
  resultRevision: 'rev-1',
  orderId: 'order-1',
  orderNumber: null,
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
  it('names the checkout and leaves the placement placeholders unencoded', () => {
    expect(
      buildReturnUrl(
        'https://shop.example',
        '/uk/checkout/return',
        'Z2lkOi8v/1'
      )
    ).toBe(
      'https://shop.example/uk/checkout/return?checkout=Z2lkOi8v%2F1' +
        '&placement={placementId}&token={placementToken}'
    );
  });

  it('refuses a return URL over the provider limit', () => {
    expect(() =>
      buildReturnUrl('https://shop.example', `/${'a'.repeat(500)}`, 'c-1')
    ).toThrow();
  });

  it('ignores placeholders the backend did not fill in', () => {
    expect(
      readReturnParams(
        '?checkout=c-1&placement={placementId}&token={placementToken}'
      )
    ).toEqual({ checkoutId: 'c-1', locator: null });
  });

  it('reads the placement from the URL first', () => {
    const params = readReturnParams(
      '?checkout=checkout-1&placement=p-9&token=t-9'
    );
    expect(params).toEqual({
      checkoutId: 'checkout-1',
      locator: { placementId: 'p-9', placementToken: 't-9' },
    });
    expect(resolveRecoveryLocator(params, attempt)).toEqual({
      placementId: 'p-9',
      placementToken: 't-9',
    });
  });

  it('takes the token from the journal after the URL lost it on reload', () => {
    const withToken = { ...attempt, placementToken: 't-journal' };
    expect(
      resolveRecoveryLocator(
        readReturnParams('?checkout=checkout-1&placement=from-journal'),
        withToken
      )
    ).toEqual({ placementId: 'from-journal', placementToken: 't-journal' });
    expect(
      resolveRecoveryLocator(
        readReturnParams('?checkout=checkout-1&placement=other'),
        withToken
      )
    ).toEqual({ placementId: 'other', placementToken: null });
  });

  it('falls back to the journal without placement parameters', () => {
    expect(
      resolveRecoveryLocator(readReturnParams('?checkout=checkout-1'), attempt)
    ).toEqual({
      placementId: 'from-journal',
      placementToken: null,
    });
  });

  it('removes the token from the address bar', () => {
    const replaceState = vi.fn();
    stripReturnToken(
      {
        href: 'https://shop.example/checkout/return?placement=p&token=secret',
      } as Location,
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

  it('keeps following an outstanding redirect after the buyer returns before its callback', async () => {
    const read = vi
      .fn()
      .mockResolvedValueOnce({
        ...base,
        status: 'REQUIRES_ACTION',
        customerAction: { type: 'REDIRECT', url: 'https://pay.example' },
      })
      .mockResolvedValueOnce(base)
      .mockResolvedValueOnce({ ...base, status: 'PAID' });
    const outcomes: string[] = [];
    await pollPlacement({
      read,
      locator,
      flow: 'ONLINE',
      signal: new AbortController().signal,
      onResult: (_result, outcome) => outcomes.push(outcome.kind),
      onMissing: vi.fn(),
      wait: async () => undefined,
    });
    expect(outcomes).toEqual(['redirect', 'awaiting-payment', 'accepted']);
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

describe('useReadPlacement', () => {
  const payload = {
    placementId: 'placement-1',
    placementToken: null,
    placementState: 'PLACED',
    paymentFlow: null,
    checkoutId: null,
    resultRevision: null,
    orderId: 'order-1',
    orderNumber: '1001',
    status: 'PAID',
    customerAction: null,
    paymentFailure: null,
    userErrors: [],
  };
  const tokens = () =>
    apollo.query.mock.calls.map(([options]) => options.variables.token);

  it('reads as the buyer first and keeps the token of the locator', async () => {
    apollo.query
      .mockReset()
      .mockResolvedValue({ data: { checkoutPlacement: payload } });
    const { result } = renderHook(() => useReadPlacement());
    const placement = await result.current({
      placementId: 'placement-1',
      placementToken: 't-1',
    });
    expect(tokens()).toEqual([null]);
    expect(placement).toMatchObject({
      orderNumber: '1001',
      placementToken: 't-1',
    });
  });

  it('falls back to the token when the buyer read finds nothing or is refused', async () => {
    apollo.query
      .mockReset()
      .mockRejectedValueOnce(new Error('FORBIDDEN'))
      .mockResolvedValueOnce({ data: { checkoutPlacement: payload } });
    const { result } = renderHook(() => useReadPlacement());
    await result.current({ placementId: 'placement-1', placementToken: 't-1' });
    expect(tokens()).toEqual([null, 't-1']);
  });

  it('reports a missing placement without a token', async () => {
    apollo.query
      .mockReset()
      .mockResolvedValue({ data: { checkoutPlacement: null } });
    const { result } = renderHook(() => useReadPlacement());
    await expect(
      result.current({ placementId: 'placement-1', placementToken: null })
    ).resolves.toBeNull();
    expect(tokens()).toEqual([null]);
  });

  it('reports a placement the API will never return as missing', async () => {
    apollo.query.mockReset().mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [{ message: 'Not found', extensions: { code: 'NOT_FOUND' } }],
      })
    );
    const { result } = renderHook(() => useReadPlacement());
    await expect(
      result.current({ placementId: 'placement-1', placementToken: 't-1' })
    ).resolves.toBeNull();
    expect(tokens()).toEqual([null, 't-1']);
  });

  it('keeps retrying a read that failed for another reason', async () => {
    apollo.query.mockReset().mockRejectedValue(new Error('Network'));
    const { result } = renderHook(() => useReadPlacement());
    await expect(
      result.current({ placementId: 'placement-1', placementToken: null })
    ).rejects.toThrow('Network');
  });
});
