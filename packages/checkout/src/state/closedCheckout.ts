/**
 * Checkout the API no longer changes: an order was placed from it (or a placement holds it),
 * or it was abandoned or expired. These user errors are not retryable; the checkout follows
 * the placement or tells the customer to start over instead of retrying the mutation.
 */
export const CLOSED_CHECKOUT_CODES: ReadonlySet<string> = new Set([
  'CHECKOUT_ALREADY_PLACED',
  'CHECKOUT_ABANDONED',
  'CHECKOUT_EXPIRED',
]);

/** Code of a closed checkout among the user errors a mutation was rejected with, or `null`. */
export function closedCheckoutCode(error: unknown): string | null {
  if (!Array.isArray(error)) {
    return null;
  }
  for (const item of error) {
    const code = typeof item === 'object' && item !== null ? Reflect.get(item, 'code') : null;
    if (typeof code === 'string' && CLOSED_CHECKOUT_CODES.has(code)) {
      return code;
    }
  }
  return null;
}
