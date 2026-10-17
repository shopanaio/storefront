import type {
  CheckoutPlacementState,
  PlaceOrderCustomerActionType,
  PlaceOrderPaymentFailureCategory,
  PlaceOrderStatus,
} from '#checkout/graphql/operations';
import type { Checkout } from '#checkout/types/entity';

export type PlacementStatus = PlaceOrderStatus;

export interface PlacementCustomerAction {
  type: PlaceOrderCustomerActionType;
  url: string | null;
  title: string | null;
  instructions: string | null;
  expiresAt: string | null;
  sdk: string | null;
  params: object | null;
  data: object | null;
}

export interface PlacementPaymentFailure {
  category: PlaceOrderPaymentFailureCategory;
  code: string;
  message: string;
  retryable: boolean;
  providerCode: string | null;
}

export interface PlacementUserError {
  code: string;
  field: string[];
  message: string;
  retryable: boolean;
}

/** Durable result of a `placeOrder` attempt, as returned by `placeOrder` and `checkoutPlacement`. */
export interface PlacementResult {
  placementId: string | null;
  /**
   * Capability token for reading the placement without checkout access (B4).
   * Always `null` until the API returns it.
   */
  placementToken: string | null;
  placementState: CheckoutPlacementState | null;
  checkoutId: string | null;
  resultRevision: string | null;
  orderId: string | null;
  status: PlacementStatus | null;
  customerAction: PlacementCustomerAction | null;
  paymentFailure: PlacementPaymentFailure | null;
  userErrors: PlacementUserError[];
}

/** Where a placement can be read from: the attempt journal before B4, the return URL after it. */
export interface PlacementLocator {
  placementId: string;
  placementToken: string | null;
}

export type PaymentFlow = Checkout.PaymentFlow;

/**
 * What the checkout does next with a placement result.
 * - `accepted`: the order is placed; show the result screen and clear the cart (decision 1.6).
 * - `redirect`: send the buyer to the payment provider.
 * - `client-sdk`: hand the action to a client SDK module.
 * - `awaiting-payment`: poll `checkoutPlacement` until the payment settles.
 * - `payment-failed`: stay in checkout with the cart intact; retry with a new key.
 * - `rejected`: the placement did not happen; show the error by code.
 */
export type PlacementOutcome =
  | { kind: 'accepted'; orderId: string | null; status: PlacementStatus }
  | { kind: 'redirect'; url: string }
  | { kind: 'client-sdk'; action: PlacementCustomerAction }
  | { kind: 'awaiting-payment'; locator: PlacementLocator }
  | { kind: 'payment-failed'; failure: PlacementPaymentFailure | null }
  | { kind: 'rejected'; code: string; retryable: boolean };
