import { describe, expect, it } from 'vitest';
import type { Checkout } from '#checkout/types/entity';
import { checkoutReadiness } from './readiness';

const NOW = Date.parse('2026-10-18T10:00:00Z');

const issue = (patch: Partial<Checkout.Issue>): Checkout.Issue => ({
  code: 'X',
  message: 'Message from the API',
  severity: 'WARNING',
  effect: 'CONTINUE',
  field: [],
  lineId: null,
  retryable: false,
  ...patch,
});

const checkout = (patch: Partial<Checkout.Checkout> = {}) =>
  ({
    status: 'READY',
    valid: true,
    expiresAt: new Date(NOW + 60_000),
    issues: [],
    ...patch,
  }) as Checkout.Checkout;

describe('checkoutReadiness', () => {
  it('allows placing a valid READY checkout before it expires', () => {
    expect(checkoutReadiness(checkout(), NOW)).toEqual({
      canPlace: true,
      expired: false,
      blocking: [],
      notices: [],
    });
  });

  it.each([
    ['an OPEN checkout', { status: 'OPEN' as const }],
    ['an invalid checkout', { valid: false }],
  ])('blocks %s', (_name, patch) => {
    expect(checkoutReadiness(checkout(patch), NOW).canPlace).toBe(false);
  });

  it('treats a checkout past expiresAt as expired', () => {
    const readiness = checkoutReadiness(checkout({ expiresAt: new Date(NOW) }), NOW);
    expect(readiness).toMatchObject({ canPlace: false, expired: true });
    expect(checkoutReadiness(checkout({ status: 'ABANDONED' }), NOW).expired).toBe(true);
  });

  it('splits blocking issues from notices', () => {
    const stop = issue({ effect: 'STOP', severity: 'ERROR' });
    const warning = issue({ code: 'PRICE_CHANGED' });
    const readiness = checkoutReadiness(checkout({ issues: [stop, warning] }), NOW);
    expect(readiness).toMatchObject({ canPlace: false, blocking: [stop], notices: [warning] });
  });
});
