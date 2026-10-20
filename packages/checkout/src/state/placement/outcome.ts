import type { StorefrontPlaceOrderPayloadFragment } from '#checkout/graphql/operations';
import type {
  PaymentFlow,
  PlacementLocator,
  PlacementOutcome,
  PlacementResult,
  PlacementStatus,
} from '#checkout/state/placement/types';

/**
 * Codes that mean a placement already exists for this checkout or its workflow is still running.
 * The answer is read from the placement itself; the API message is a generic text and is not shown.
 */
export const RECOVERABLE_PLACEMENT_CODES: ReadonlySet<string> = new Set([
  'CHECKOUT_ALREADY_PLACED',
  'CHECKOUT_PLACEMENT_FAILED',
  'CHECKOUT_PLACEMENT_SNAPSHOT_STALE',
  'CHECKOUT_PLACEMENT_WORKFLOW_MISMATCH',
  'CHECKOUT_PLACEMENT_RECOVERY_CONFLICT',
]);

/** The key was used before with a different request; a new key is required. */
export const IDEMPOTENCY_MISMATCH_CODE = 'IDEMPOTENCY_KEY_PARAMETER_MISMATCH';

/**
 * The checkout was recalculated before the placement and a delivery or payment choice went
 * stale: no placement was made, and the checkout stays open with the reset choice, its reason
 * and the new price (BR-1vtb). The buyer chooses again; the checkout is not renewed.
 */
export const STALE_SELECTION_CODE = 'CHECKOUT_OPEN';

/**
 * A buyer signed in, but this guest checkout was not claimed by the account yet (B6). The order
 * is not placed as a guest: the account claims the checkout, its prices are read again and the
 * buyer places the order from the account checkout.
 */
export const CLAIM_REQUIRED_CODE = 'CHECKOUT_CLAIM_REQUIRED';

/** The store requires an account (S7): the guest signs in before placing the order. */
export const GUEST_NOT_ALLOWED_CODE = 'CHECKOUT_GUEST_NOT_ALLOWED';

/** Frontend-only code: the API answered with a client SDK nobody registered. */
export const CLIENT_SDK_UNAVAILABLE_CODE = 'CLIENT_SDK_UNAVAILABLE';

/** Frontend-only code: the request did not reach the API or its answer was lost. */
export const NETWORK_ERROR_CODE = 'NETWORK_ERROR';

/**
 * Frontend-only code: the API answered with an error that does not prove the order was not
 * placed (an internal error may come after the workflow ran). The key is kept for a safe retry.
 */
export const PLACEMENT_UNCONFIRMED_CODE = 'PLACEMENT_UNCONFIRMED';

/**
 * Frontend-only code: a value the buyer entered (address, contact, note, recipient) failed to
 * save, so `placeOrder` was not sent.
 */
export const INPUT_UNSAVED_CODE = 'CHECKOUT_INPUT_UNSAVED';

/**
 * Frontend-only code: the loyalty quote renewed before placing pays a different amount, so
 * `placeOrder` was not sent and the buyer reviews the totals.
 */
export const LOYALTY_QUOTE_CHANGED_CODE = 'CHECKOUT_LOYALTY_QUOTE_CHANGED';

/**
 * GraphQL error codes raised before `placeOrder` runs: parsing, validation, authentication and
 * the storefront permission check. Only these close the attempt.
 */
export const DEFINITE_REJECTION_CODES: ReadonlySet<string> = new Set([
  'GRAPHQL_PARSE_FAILED',
  'GRAPHQL_VALIDATION_FAILED',
  'BAD_USER_INPUT',
  'UNAUTHENTICATED',
  'FORBIDDEN',
]);

type GraphQLErrorLike = {
  message: string;
  extensions?: Record<string, unknown>;
};

/** Whether every GraphQL error proves that `placeOrder` did not run. */
export function isDefiniteRejection(
  errors: ReadonlyArray<GraphQLErrorLike>
): boolean {
  return (
    errors.length > 0 &&
    errors.every((error) => {
      const code = error.extensions?.code;
      return typeof code === 'string' && DEFINITE_REJECTION_CODES.has(code);
    })
  );
}

/** Thrown by `submitCheckout` when the outcome of the request is unknown; the key is kept. */
export class PlacementUnconfirmedError extends Error {
  constructor() {
    super('The placeOrder outcome is unknown.');
    this.name = 'PlacementUnconfirmedError';
  }
}

export function mapPlacementPayload(
  payload: StorefrontPlaceOrderPayloadFragment
): PlacementResult {
  return {
    placementId: payload.placementId ?? null,
    placementToken: payload.placementToken ?? null,
    placementState: payload.placementState ?? null,
    checkoutId: payload.checkoutId ?? null,
    resultRevision: payload.resultRevision ?? null,
    orderId: payload.orderId ?? null,
    orderNumber: payload.orderNumber ?? null,
    status: payload.status ?? null,
    paymentFlow: payload.paymentFlow ?? null,
    customerAction: payload.customerAction
      ? {
          type: payload.customerAction.type,
          url: payload.customerAction.url ?? null,
          title: payload.customerAction.title ?? null,
          instructions: payload.customerAction.instructions ?? null,
          expiresAt: payload.customerAction.expiresAt ?? null,
          sdk: payload.customerAction.sdk ?? null,
          params: payload.customerAction.params ?? null,
          data: payload.customerAction.data ?? null,
        }
      : null,
    paymentFailure: payload.paymentFailure
      ? {
          category: payload.paymentFailure.category,
          code: payload.paymentFailure.code,
          message: payload.paymentFailure.message,
          retryable: payload.paymentFailure.retryable,
          providerCode: payload.paymentFailure.providerCode ?? null,
        }
      : null,
    userErrors: payload.userErrors.map((error) => ({
      code: error.code,
      field: [...(error.field ?? [])],
      message: error.message,
      retryable: error.retryable,
    })),
  };
}

/**
 * Placement result for a `placeOrder` request the API refused before running it
 * (`isDefiniteRejection`). The attempt is closed instead of being resent.
 */
export function graphQLErrorPlacement(
  checkoutId: string,
  errors: ReadonlyArray<GraphQLErrorLike>
): PlacementResult {
  const code = errors[0]?.extensions?.code;
  return {
    placementId: null,
    placementToken: null,
    placementState: null,
    checkoutId,
    resultRevision: null,
    orderId: null,
    orderNumber: null,
    status: null,
    paymentFlow: null,
    customerAction: null,
    paymentFailure: null,
    userErrors: [
      {
        code: typeof code === 'string' ? code : 'CHECKOUT_PLACEMENT_FAILED',
        field: [],
        message: errors[0]?.message ?? '',
        retryable: false,
      },
    ],
  };
}

export function placementLocatorOf(
  result: PlacementResult
): PlacementLocator | null {
  return result.placementId
    ? { placementId: result.placementId, placementToken: result.placementToken }
    : null;
}

/**
 * Decides what to do with a placement result (plan, stage 1, task 4).
 *
 * `flow` is the flow of the payment method the attempt was placed with; `fallback` is the
 * placement known from the attempt journal, used when the API rejects a repeated placement
 * without naming it.
 */
export function resolvePlacementOutcome(
  result: PlacementResult,
  flow: PaymentFlow | null,
  fallback: PlacementLocator | null = null
): PlacementOutcome {
  flow = result.paymentFlow ?? flow;
  const locator = placementLocatorOf(result) ?? fallback;

  switch (result.status) {
    case 'PAID':
    case 'AUTHORIZED':
    case 'PAYMENT_NOT_REQUIRED':
      return accepted(result, result.status, flow);
    case 'PAYMENT_PENDING':
      if (flow === 'OFFLINE' || flow === 'ON_DELIVERY') {
        return accepted(result, result.status, flow);
      }
      return awaitingOrRejected(locator);
    case 'REQUIRES_ACTION': {
      const action = result.customerAction;
      if (action?.type === 'REDIRECT' && action.url) {
        return { kind: 'redirect', url: action.url };
      }
      if (action?.type === 'CLIENT_SDK') {
        return { kind: 'client-sdk', action };
      }
      if (
        action?.type === 'INSTRUCTIONS' &&
        (flow === 'OFFLINE' || flow === null)
      ) {
        // Decision 1.11: for an OFFLINE method the order is placed at once; the instructions
        // are not shown. A read without the journal (another browser) does not know the flow
        // and trusts the action. Instructions of an online method wait for the payment.
        return accepted(result, result.status, flow);
      }
      // The action expired or the session no longer awaits it: the server settles the payment.
      return awaitingOrRejected(locator);
    }
    case 'REQUIRES_CONFIRMATION':
      // Decision 1.1: handled as a pending payment until the Stripe app brings real confirmation.
      return awaitingOrRejected(locator);
    case 'PAYMENT_FAILED':
      return { kind: 'payment-failed', failure: result.paymentFailure };
    default:
      break;
  }

  const error = result.userErrors[0] ?? null;
  if (result.placementState === 'FAILED') {
    return {
      kind: 'rejected',
      code: error?.code ?? 'CHECKOUT_PLACEMENT_FAILED',
      retryable: false,
    };
  }
  if (locator && (!error || RECOVERABLE_PLACEMENT_CODES.has(error.code))) {
    // The placement exists and its workflow has not produced a result yet.
    return { kind: 'awaiting-payment', locator };
  }
  return {
    kind: 'rejected',
    code: error?.code ?? 'CHECKOUT_PLACEMENT_FAILED',
    retryable: error?.retryable ?? false,
  };
}

function accepted(
  result: PlacementResult,
  status: PlacementStatus,
  paymentFlow: PaymentFlow | null
): PlacementOutcome {
  return {
    kind: 'accepted',
    orderId: result.orderId,
    orderNumber: result.orderNumber,
    status,
    paymentFlow,
  };
}

function awaitingOrRejected(
  locator: PlacementLocator | null
): PlacementOutcome {
  return locator
    ? { kind: 'awaiting-payment', locator }
    : { kind: 'rejected', code: 'CHECKOUT_PLACEMENT_FAILED', retryable: false };
}

/** Whether polling `checkoutPlacement` should stop on this outcome. */
export function isSettledOutcome(outcome: PlacementOutcome): boolean {
  return (
    outcome.kind === 'accepted' ||
    outcome.kind === 'payment-failed' ||
    outcome.kind === 'rejected'
  );
}

/** Polling delay for the given attempt: 2 → 4 → 8 → 16 → 30 s, then 30 s without a limit (1.9). */
export function placementPollDelay(attempt: number): number {
  return Math.min(2000 * 2 ** Math.max(0, attempt), 30000);
}
