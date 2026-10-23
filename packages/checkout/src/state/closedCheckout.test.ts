import { describe, expect, it } from 'vitest';
import { closedCheckoutCode } from './closedCheckout';

describe('closedCheckoutCode', () => {
  it('finds the code of a closed checkout among user errors', () => {
    expect(
      closedCheckoutCode([
        {
          code: 'CHECKOUT_EXPIRED',
          message: 'Checkout has expired.',
          retryable: false,
        },
      ])
    ).toBe('CHECKOUT_EXPIRED');
  });

  it('ignores other user errors and transport errors', () => {
    expect(
      closedCheckoutCode([
        { code: 'CHECKOUT_BUSY', message: 'Busy', retryable: true },
      ])
    ).toBeNull();
    expect(closedCheckoutCode(new Error('Failed to fetch'))).toBeNull();
  });
});
