import { describe, expect, it } from 'vitest';
import {
  isDefiniteRejection,
  placementPollDelay,
  resolvePlacementOutcome,
} from '#checkout/state/placement/outcome';
import type { PlacementResult } from '#checkout/state/placement/types';

function result(patch: Partial<PlacementResult> = {}): PlacementResult {
  return {
    placementId: 'placement-1',
    placementToken: null,
    placementState: 'PLACED',
    checkoutId: 'checkout-1',
    resultRevision: 'rev-1',
    orderId: 'order-1',
    status: null,
    customerAction: null,
    paymentFailure: null,
    userErrors: [],
    ...patch,
  };
}

const action = {
  url: null,
  title: null,
  instructions: null,
  expiresAt: null,
  sdk: null,
  params: null,
  data: null,
};

describe('resolvePlacementOutcome', () => {
  it.each(['PAID', 'AUTHORIZED', 'PAYMENT_NOT_REQUIRED'] as const)(
    'accepts %s',
    (status) => {
      expect(resolvePlacementOutcome(result({ status }), 'ONLINE')).toEqual({
        kind: 'accepted',
        orderId: 'order-1',
        status,
      });
    }
  );

  it.each(['OFFLINE', 'ON_DELIVERY'] as const)(
    'accepts a pending payment of a %s method',
    (flow) => {
      expect(
        resolvePlacementOutcome(result({ status: 'PAYMENT_PENDING' }), flow).kind
      ).toBe('accepted');
    }
  );

  it('waits for a pending online payment', () => {
    expect(
      resolvePlacementOutcome(result({ status: 'PAYMENT_PENDING' }), 'ONLINE')
    ).toEqual({
      kind: 'awaiting-payment',
      locator: { placementId: 'placement-1', placementToken: null },
    });
  });

  it('waits on REQUIRES_CONFIRMATION', () => {
    expect(
      resolvePlacementOutcome(result({ status: 'REQUIRES_CONFIRMATION' }), 'ONLINE')
        .kind
    ).toBe('awaiting-payment');
  });

  it('redirects on REQUIRES_ACTION with REDIRECT', () => {
    expect(
      resolvePlacementOutcome(
        result({
          status: 'REQUIRES_ACTION',
          customerAction: { ...action, type: 'REDIRECT', url: 'https://pay.example/1' },
        }),
        'ONLINE'
      )
    ).toEqual({ kind: 'redirect', url: 'https://pay.example/1' });
  });

  it('hands CLIENT_SDK to a module', () => {
    const sdkAction = { ...action, type: 'CLIENT_SDK' as const, sdk: 'stripe' };
    expect(
      resolvePlacementOutcome(
        result({ status: 'REQUIRES_ACTION', customerAction: sdkAction }),
        'ONLINE'
      )
    ).toEqual({ kind: 'client-sdk', action: sdkAction });
  });

  it('accepts INSTRUCTIONS at once (decision 1.11)', () => {
    expect(
      resolvePlacementOutcome(
        result({
          status: 'REQUIRES_ACTION',
          customerAction: { ...action, type: 'INSTRUCTIONS' },
        }),
        'OFFLINE'
      )
    ).toEqual({ kind: 'accepted', orderId: 'order-1', status: 'REQUIRES_ACTION' });
  });

  it('waits when the customer action is gone', () => {
    expect(
      resolvePlacementOutcome(result({ status: 'REQUIRES_ACTION' }), 'ONLINE').kind
    ).toBe('awaiting-payment');
  });

  it('reports a failed payment even when it is not retryable (decision 1.7)', () => {
    const failure = {
      category: 'DECLINED' as const,
      code: 'liqpay_failure',
      message: 'Declined',
      retryable: false,
      providerCode: 'liqpay',
    };
    expect(
      resolvePlacementOutcome(
        result({ status: 'PAYMENT_FAILED', paymentFailure: failure }),
        'ONLINE'
      )
    ).toEqual({ kind: 'payment-failed', failure });
  });

  it('recovers an already placed checkout from the journal placement', () => {
    expect(
      resolvePlacementOutcome(
        result({
          placementId: null,
          placementState: null,
          orderId: null,
          userErrors: [
            {
              code: 'CHECKOUT_ALREADY_PLACED',
              field: ['input'],
              message: 'The checkout could not be placed.',
              retryable: false,
            },
          ],
        }),
        'ONLINE',
        { placementId: 'from-journal', placementToken: null }
      )
    ).toEqual({
      kind: 'awaiting-payment',
      locator: { placementId: 'from-journal', placementToken: null },
    });
  });

  it('waits for a placement whose workflow has no result yet', () => {
    expect(
      resolvePlacementOutcome(
        result({ placementState: 'RESOURCES_RESERVED', orderId: null }),
        'ONLINE'
      ).kind
    ).toBe('awaiting-payment');
  });

  it('rejects a failed placement without a result', () => {
    expect(
      resolvePlacementOutcome(result({ placementState: 'FAILED' }), 'ONLINE')
    ).toEqual({ kind: 'rejected', code: 'CHECKOUT_PLACEMENT_FAILED', retryable: false });
  });

  it('rejects by the user error code', () => {
    expect(
      resolvePlacementOutcome(
        result({
          placementId: null,
          placementState: null,
          userErrors: [
            {
              code: 'IDEMPOTENCY_KEY_PARAMETER_MISMATCH',
              field: ['input', 'idempotencyKey'],
              message: 'x',
              retryable: false,
            },
          ],
        }),
        'ONLINE'
      )
    ).toEqual({
      kind: 'rejected',
      code: 'IDEMPOTENCY_KEY_PARAMETER_MISMATCH',
      retryable: false,
    });
  });
});

describe('placementPollDelay', () => {
  it('backs off from 2 to 30 seconds without a limit', () => {
    expect([0, 1, 2, 3, 4, 5, 50].map(placementPollDelay)).toEqual([
      2000, 4000, 8000, 16000, 30000, 30000, 30000,
    ]);
  });
});

describe('isDefiniteRejection', () => {
  it('accepts only errors raised before placeOrder runs', () => {
    expect(isDefiniteRejection([{ message: 'x', extensions: { code: 'FORBIDDEN' } }])).toBe(true);
    expect(
      isDefiniteRejection([
        { message: 'x', extensions: { code: 'FORBIDDEN' } },
        { message: 'y', extensions: { code: 'INTERNAL_SERVER_ERROR' } },
      ])
    ).toBe(false);
    expect(isDefiniteRejection([{ message: 'x' }])).toBe(false);
    expect(isDefiniteRejection([])).toBe(false);
  });
});
