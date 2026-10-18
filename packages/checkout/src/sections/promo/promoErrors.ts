import { CombinedGraphQLErrors } from '@apollo/client';

/**
 * Code of a rejected promo code mutation: a user error code, or the GraphQL error code the
 * checkout raises for an invalid code. The API message is not shown; texts are chosen by code.
 */
export function promoErrorCode(error: unknown): string | null {
  if (Array.isArray(error)) {
    const code = error.find(
      (item): item is { code: string } =>
        typeof item === 'object' && item !== null && typeof Reflect.get(item, 'code') === 'string'
    )?.code;
    return code ?? null;
  }
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors.find((item) => typeof item.extensions?.code === 'string')
      ?.extensions?.code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

/** Message key (Checkout namespace) for a promo code error. */
export function promoErrorMessageKey(code: string | null): string {
  switch (code) {
    case 'PROMO_NOT_APPLICABLE':
    case 'CHECKOUT_DISCOUNT_CODE_INVALID':
      return 'promo-error-invalid';
    default:
      return 'promo-error-generic';
  }
}

/** Frontend-only code: the API took the code but the pricing applies no discount for it. */
export const PROMO_NOT_APPLICABLE = 'PROMO_NOT_APPLICABLE';

/** Whether `code` is among the applied codes; the API upper-cases codes it stores. */
export function isPromoApplied(applied: readonly string[], code: string): boolean {
  const wanted = code.trim().toUpperCase();
  return applied.some((item) => item.trim().toUpperCase() === wanted);
}

/**
 * Message key for a code the API took but the pricing did not apply. The API does not say why:
 * with other codes applied, the code may be valid but not combinable with them.
 */
export function promoNotAppliedMessageKey(otherAppliedCodes: number): string {
  return otherAppliedCodes > 0
    ? 'promo-error-not-combinable'
    : promoErrorMessageKey(PROMO_NOT_APPLICABLE);
}
