import { describe, expect, it } from 'vitest';
import { CombinedGraphQLErrors } from '@apollo/client';
import {
  isPromoEntered,
  promoErrorCode,
  promoErrorMessageKey,
} from './promoErrors';
import { mapCheckoutToPromoFormData } from './mapper';
import type { Checkout } from '#checkout/types/entity';

describe('promo codes', () => {
  it('lists every entered code with its state', () => {
    const checkout = {
      promoCodes: [
        { code: 'SALE', status: 'APPLIED', message: null },
        {
          code: 'FREESHIP',
          status: 'PENDING',
          message: 'Choose a delivery method',
        },
      ],
    } as Checkout.Checkout;
    expect(mapCheckoutToPromoFormData(checkout)?.codes).toEqual([
      { code: 'SALE', status: 'APPLIED', message: null },
      {
        code: 'FREESHIP',
        status: 'PENDING',
        message: 'Choose a delivery method',
      },
    ]);
  });

  it('compares codes the way the API stores them', () => {
    expect(isPromoEntered(['SALE'], ' sale ')).toBe(true);
    expect(isPromoEntered(['SALE'], 'other')).toBe(false);
  });

  it('reads the error code from user errors and GraphQL errors', () => {
    expect(
      promoErrorCode([{ code: 'CHECKOUT_DISCOUNT_CODE_INVALID', message: 'x' }])
    ).toBe('CHECKOUT_DISCOUNT_CODE_INVALID');
    const graphQLError = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'x',
          extensions: { code: 'CHECKOUT_DISCOUNT_CODE_INVALID' },
        },
      ],
    });
    expect(promoErrorCode(graphQLError)).toBe('CHECKOUT_DISCOUNT_CODE_INVALID');
    expect(promoErrorCode(new Error('network'))).toBeNull();
  });

  it('chooses the text by code', () => {
    expect(promoErrorMessageKey('CHECKOUT_DISCOUNT_CODE_INVALID')).toBe(
      'promo-error-invalid'
    );
    expect(promoErrorMessageKey(null)).toBe('promo-error-generic');
  });
});
