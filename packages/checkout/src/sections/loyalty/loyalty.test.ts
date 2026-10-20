import { describe, expect, it } from 'vitest';
import type { Checkout } from '#checkout/types/entity';
import {
  currentSelection,
  quoteNeedsRenewal,
  selectionInput,
} from './selection';
import { checkRedemptionInput, parseRedemptionInput, redemptionBounds } from './bounds';
import { classifyLoyaltyIssue, issueSource, redemptionIssueMessageKey } from './issues';

const uah = (amount: number) => ({ amount, currencyCode: 'UAH' });

const redemption = (
  overrides: Partial<Checkout.LoyaltyRedemption> = {}
): Checkout.LoyaltyRedemption => ({
  source: 'POINTS',
  requestedPoints: null,
  requestedAmount: null,
  points: '500',
  availablePoints: '1240',
  availableAmount: uah(124),
  discount: uah(50),
  expiresAt: null,
  ...overrides,
});

const points: Checkout.LoyaltySourceOption = {
  source: 'POINTS',
  availablePoints: '1240',
  availableAmount: uah(124),
  minimum: { points: '100', amount: uah(10) },
  maximumPerOrder: { points: '5000', amount: uah(500) },
};

const issue = (overrides: Partial<Checkout.Issue>): Checkout.Issue => ({
  code: 'X',
  message: '',
  severity: 'ERROR',
  effect: 'STOP',
  field: ['loyaltyRedemption'],
  lineId: null,
  retryable: false,
  ...overrides,
});

describe('loyalty selection', () => {
  it('sends the other choice as it is with each write', () => {
    const checkout = {
      loyaltyRedemption: redemption({ requestedPoints: '300' }),
      loyaltyRewardId: 'reward-1',
      loyaltySelection: { source: 'POINTS', points: '300', amount: null, rewardId: 'reward-1' },
    } as Checkout.Checkout;
    const selection = currentSelection(checkout);

    expect(selection).toEqual({
      redemption: { source: 'POINTS', points: '300' },
      rewardId: 'reward-1',
    });
    expect(selectionInput({ ...selection, redemption: null })).toEqual({
      source: null,
      points: null,
      amount: null,
      rewardId: 'reward-1',
    });
  });

  it('K2: reads the saved choice, also when the calculation did not apply it', () => {
    const checkout = {
      loyaltyRedemption: null,
      loyaltyRewardId: null,
      loyaltySelection: {
        source: 'STORE_CREDIT',
        points: null,
        amount: uah(80.5),
        rewardId: 'reward-1',
      },
    } as Checkout.Checkout;
    expect(currentSelection(checkout)).toEqual({
      redemption: { source: 'STORE_CREDIT', amount: '80.5' },
      rewardId: 'reward-1',
    });
    expect(
      currentSelection({ loyaltySelection: null } as Checkout.Checkout)
    ).toEqual({ redemption: null, rewardId: null });
  });

  it('removes the selection when nothing is chosen', () => {
    expect(selectionInput({ redemption: null, rewardId: null })).toBeNull();
  });

  it('sends store credit as an amount and the maximum as null', () => {
    expect(
      selectionInput({ redemption: { source: 'STORE_CREDIT', amount: null }, rewardId: null })
    ).toEqual({ source: 'STORE_CREDIT', points: null, amount: null, rewardId: null });
  });

  it('renews a quote that expires within a minute', () => {
    const now = Date.parse('2026-10-20T12:00:00Z');
    expect(quoteNeedsRenewal(new Date(now + 30_000), now)).toBe(true);
    expect(quoteNeedsRenewal(new Date(now + 5 * 60_000), now)).toBe(false);
    expect(quoteNeedsRenewal(null, now)).toBe(false);
  });
});

describe('redemption bounds', () => {
  it('takes the smallest upper bound the API gives', () => {
    expect(redemptionBounds(points, null)).toEqual({ min: '100', max: '1240' });
    expect(redemptionBounds(points, redemption({ points: '350' }))).toEqual({
      min: '100',
      max: '350',
    });
  });

  it('ignores the applied amount of a custom request', () => {
    expect(
      redemptionBounds(points, redemption({ requestedPoints: '200', points: '200' }))
    ).toEqual({ min: '100', max: '1240' });
  });

  it('checks a typed amount against the bounds', () => {
    const bounds = { min: '100', max: '500' };
    expect(checkRedemptionInput('POINTS', parseRedemptionInput('POINTS', '2 000'), bounds)).toEqual({
      code: 'too-large',
      max: '500',
    });
    expect(checkRedemptionInput('POINTS', parseRedemptionInput('POINTS', '50'), bounds)).toEqual({
      code: 'too-small',
      min: '100',
    });
    expect(checkRedemptionInput('POINTS', parseRedemptionInput('POINTS', '1.5'), bounds)).toEqual({
      code: 'invalid',
    });
    expect(parseRedemptionInput('STORE_CREDIT', '80,5')).toBe('80.5');
    expect(checkRedemptionInput('STORE_CREDIT', '80.5', { min: '1', max: '120' })).toBeNull();
  });
});

describe('loyalty issues', () => {
  it('tells a reduced redemption from one the reduction dropped', () => {
    const reduced = issue({
      code: 'LOYALTY_REDEMPTION_REDUCED',
      effect: 'CONTINUE',
      field: ['loyaltyRedemption', 'points'],
    });
    expect(classifyLoyaltyIssue(reduced, redemption()).kind).toBe('reduced');
    expect(classifyLoyaltyIssue(reduced, null).kind).toBe('dropped');
  });

  it('reads rewards, sign-in and retries by code', () => {
    expect(classifyLoyaltyIssue(issue({ code: 'ENTITLEMENT_NOT_AVAILABLE' }), null).kind).toBe(
      'reward'
    );
    expect(classifyLoyaltyIssue(issue({ code: 'REWARD_DISCOUNT_NOT_APPLIED' }), null).kind).toBe(
      'rewardInactive'
    );
    expect(classifyLoyaltyIssue(issue({ code: 'CUSTOMER_REQUIRED' }), null).kind).toBe('signIn');
    // A placement error, not a checkout issue: it never reaches the loyalty banners.
    expect(
      classifyLoyaltyIssue(issue({ code: 'LOYALTY_CUSTOMER_REQUIRED' }), null).kind
    ).not.toBe('signIn');
    expect(
      classifyLoyaltyIssue(
        issue({ code: 'CHECKOUT_LOYALTY_UNAVAILABLE', effect: 'CONTINUE', retryable: true }),
        null
      ).kind
    ).toBe('retry');
  });

  it('names the source by the saved choice, then by the issue field', () => {
    expect(issueSource({ field: ['loyaltyRedemption', 'amount'] }, null)).toBe('STORE_CREDIT');
    expect(issueSource({ field: ['loyaltyRedemption'] }, 'STORE_CREDIT')).toBe('STORE_CREDIT');
    expect(redemptionIssueMessageKey({ code: 'BELOW_MINIMUM_REDEMPTION' }, 'POINTS')).toBe(
      'loyalty-banner-points-below-minimum'
    );
  });
});
