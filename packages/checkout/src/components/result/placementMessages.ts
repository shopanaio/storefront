import type { PlacementStatus } from '#checkout/state/placement/types';
import {
  CLAIM_REQUIRED_CODE,
  CLIENT_SDK_UNAVAILABLE_CODE,
  GUEST_NOT_ALLOWED_CODE,
  IDEMPOTENCY_MISMATCH_CODE,
  INPUT_UNSAVED_CODE,
  NETWORK_ERROR_CODE,
  PLACEMENT_UNCONFIRMED_CODE,
  STALE_SELECTION_CODE,
} from '#checkout/state/placement/outcome';

/**
 * Message key (Checkout namespace) for a rejected placement. The API sends a generic message
 * for every placement error, so the text is chosen by `code` on the frontend.
 */
export function placementErrorMessageKey(code: string): string {
  if (code === NETWORK_ERROR_CODE) return 'placement-error-network';
  if (code === PLACEMENT_UNCONFIRMED_CODE) return 'placement-error-unconfirmed';
  if (code === INPUT_UNSAVED_CODE) return 'placement-error-unsaved';
  if (
    code === IDEMPOTENCY_MISMATCH_CODE ||
    code === 'CHECKOUT_PLACEMENT_SNAPSHOT_STALE' ||
    code === STALE_SELECTION_CODE
  ) {
    return 'placement-error-changed';
  }
  if (
    code === CLIENT_SDK_UNAVAILABLE_CODE ||
    code === 'CHECKOUT_RETURN_URL_UNSUPPORTED_BY_PAYMENT_METHOD' ||
    code.startsWith('PLACE_ORDER_RETURN_URL_')
  ) {
    return 'placement-error-payment-unavailable';
  }
  if (code === CLAIM_REQUIRED_CODE) return 'prices-updated';
  if (code === GUEST_NOT_ALLOWED_CODE) return 'sign-in-required';
  if (code === 'CHECKOUT_PLACEMENT_NOT_FOUND')
    return 'placement-error-not-found';
  if (code === 'CHECKOUT_ALREADY_PLACED')
    return 'placement-error-already-placed';
  if (code === 'CHECKOUT_ABANDONED' || code === 'CHECKOUT_EXPIRED') {
    return 'placement-error-closed';
  }
  // The loyalty reservation failed: the balance or the quote changed since the checkout read it.
  if (code.startsWith('LOYALTY_')) return 'placement-error-loyalty';
  return 'placement-error-generic';
}

/** Message key (Checkout namespace) describing the payment of an accepted order. */
export function paymentStatusMessageKey(status: PlacementStatus): string {
  switch (status) {
    case 'PAID':
      return 'payment-status-paid';
    case 'AUTHORIZED':
      return 'payment-status-authorized';
    case 'PAYMENT_NOT_REQUIRED':
      return 'payment-status-not-required';
    default:
      return 'payment-status-pending';
  }
}
