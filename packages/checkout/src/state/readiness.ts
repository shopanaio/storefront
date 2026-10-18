import type { Checkout } from '#checkout/types/entity';

/**
 * Whether an order can be placed from the checkout (plan, stage 5). The backend accepts
 * `placeOrder` only from `READY` before `expiresAt`; issues with `effect = STOP` block it too.
 */
export interface CheckoutReadiness {
  canPlace: boolean;
  /** Abandoned, expired, or past `expiresAt`: a new checkout replaces it (R5). */
  expired: boolean;
  /** Issues that block placing the order. */
  blocking: Checkout.Issue[];
  /** Issues that do not block it; shown as notices above the submit button (5.4). */
  notices: Checkout.Issue[];
}

export function isCheckoutExpired(checkout: Checkout.Checkout, now: number): boolean {
  return (
    checkout.status === 'EXPIRED' ||
    checkout.status === 'ABANDONED' ||
    (checkout.expiresAt !== null && checkout.expiresAt.getTime() <= now)
  );
}

export function checkoutReadiness(checkout: Checkout.Checkout, now: number): CheckoutReadiness {
  const expired = isCheckoutExpired(checkout, now);
  const blocking = checkout.issues.filter((issue) => issue.effect === 'STOP');
  const notices = checkout.issues.filter((issue) => issue.effect !== 'STOP');
  return {
    canPlace:
      checkout.status === 'READY' && checkout.valid && !expired && blocking.length === 0,
    expired,
    blocking,
    notices,
  };
}
