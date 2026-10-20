import { describe, expect, it } from 'vitest';
import {
  LOYALTY_QUOTE_CHANGED_CODE,
  TOTAL_CHANGED_CODE,
} from '#checkout/state/placement/outcome';
import { placementErrorMessageKey } from './placementMessages';

describe('placementErrorMessageKey', () => {
  it('S8: asks a buyer to sign in when loyalty needs an account', () => {
    expect(placementErrorMessageKey('LOYALTY_CUSTOMER_REQUIRED')).toBe('loyalty-banner-sign-in');
    expect(placementErrorMessageKey('LOYALTY_INSUFFICIENT_AVAILABLE_AMOUNT')).toBe(
      'placement-error-loyalty'
    );
  });

  it('S7: asks the buyer to review the totals when the renewed quote changed', () => {
    expect(placementErrorMessageKey(LOYALTY_QUOTE_CHANGED_CODE)).toBe('placement-error-changed');
  });

  it('SC-q2tn: asks the buyer to review the order when its total changed', () => {
    expect(placementErrorMessageKey(TOTAL_CHANGED_CODE)).toBe('placement-error-changed');
  });
});
