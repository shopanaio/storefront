import { CombinedGraphQLErrors } from '@apollo/client';

/**
 * Code of a rejected promo code mutation: a user error code, or the GraphQL error code the
 * checkout raises for an invalid code. The API message is not shown; texts are chosen by code.
 */
export function promoErrorCode(error: unknown): string | null {
  if (Array.isArray(error)) {
    const code = error.find(
      (item): item is { code: string } =>
        typeof item === 'object' &&
        item !== null &&
        typeof Reflect.get(item, 'code') === 'string'
    )?.code;
    return code ?? null;
  }
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors.find(
      (item) => typeof item.extensions?.code === 'string'
    )?.extensions?.code;
    return typeof code === 'string' ? code : null;
  }
  return null;
}

/** Message key (Checkout namespace) for a promo code error. */
export function promoErrorMessageKey(code: string | null): string {
  switch (code) {
    case 'CHECKOUT_DISCOUNT_CODE_INVALID':
      return 'promo-error-invalid';
    default:
      return 'promo-error-generic';
  }
}

/** Whether `code` is among the entered codes; the API upper-cases codes it stores. */
export function isPromoEntered(
  entered: readonly string[],
  code: string
): boolean {
  const wanted = code.trim().toUpperCase();
  return entered.some((item) => item.trim().toUpperCase() === wanted);
}
