import { describe, expect, it } from 'vitest';
import { CombinedGraphQLErrors } from '@apollo/client';
import {
  isPromoApplied,
  promoErrorCode,
  promoErrorMessageKey,
  promoNotAppliedMessageKey,
} from './promoErrors';
import { mapCheckoutToPromoFormData } from './mapper';
import type { Checkout } from '#checkout/types/entity';

describe('promo codes', () => {
  it('lists every applied code', () => {
    const checkout = {
      appliedPromoCodes: [
        { code: 'SALE', provider: 'DISCOUNT' },
        { code: 'FREESHIP', provider: 'DISCOUNT' },
      ],
    } as Checkout.Checkout;
    expect(mapCheckoutToPromoFormData(checkout)?.codes.map(({ code }) => code)).toEqual([
      'SALE',
      'FREESHIP',
    ]);
  });

  it('compares codes the way the API stores them', () => {
    expect(isPromoApplied(['SALE'], ' sale ')).toBe(true);
    expect(isPromoApplied(['SALE'], 'other')).toBe(false);
  });

  it('reads the error code from user errors and GraphQL errors', () => {
    expect(promoErrorCode([{ code: 'CHECKOUT_DISCOUNT_CODE_INVALID', message: 'x' }])).toBe(
      'CHECKOUT_DISCOUNT_CODE_INVALID'
    );
    const graphQLError = new CombinedGraphQLErrors({
      errors: [{ message: 'x', extensions: { code: 'CHECKOUT_DISCOUNT_CODE_INVALID' } }],
    });
    expect(promoErrorCode(graphQLError)).toBe('CHECKOUT_DISCOUNT_CODE_INVALID');
    expect(promoErrorCode(new Error('network'))).toBeNull();
  });

  it('chooses the text by code', () => {
    expect(promoErrorMessageKey('CHECKOUT_DISCOUNT_CODE_INVALID')).toBe('promo-error-invalid');
    expect(promoErrorMessageKey(null)).toBe('promo-error-generic');
  });

  it('says a code may not combine when other codes are applied', () => {
    expect(promoNotAppliedMessageKey(0)).toBe('promo-error-invalid');
    expect(promoNotAppliedMessageKey(1)).toBe('promo-error-not-combinable');
  });
});
