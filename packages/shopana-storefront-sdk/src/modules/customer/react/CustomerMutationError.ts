import type { CustomerUserError } from './types.js';

/**
 * Why a customer mutation failed:
 * - `unauthenticated`: there is no customer session, nothing was sent;
 * - `userErrors`: the API rejected the input, see `userErrors`;
 * - `request`: the request itself failed (network, GraphQL errors), see `cause`;
 * - `emptyPayload`: the API answered without errors and without the changed entity.
 */
export type CustomerMutationErrorKind =
  | 'unauthenticated'
  | 'userErrors'
  | 'request'
  | 'emptyPayload';

const DEFAULT_MESSAGES: Record<CustomerMutationErrorKind, string> = {
  unauthenticated: 'A customer session is required',
  userErrors: 'Unable to update the customer account',
  request: 'The customer account request failed',
  emptyPayload: 'The Storefront API returned no result',
};

export interface CustomerMutationErrorOptions {
  userErrors?: readonly CustomerUserError[];
  cause?: unknown;
}

/** The error every customer mutation of the SDK rejects with. */
export class CustomerMutationError extends Error {
  readonly kind: CustomerMutationErrorKind;
  /** Rejected fields; empty unless `kind` is `userErrors`. */
  readonly userErrors: readonly CustomerUserError[];
  /** The underlying failure of a `request` error. */
  readonly cause: unknown;

  constructor(
    kind: CustomerMutationErrorKind,
    { userErrors = [], cause }: CustomerMutationErrorOptions = {}
  ) {
    super(
      userErrors[0]?.message ??
        (cause instanceof Error ? cause.message : DEFAULT_MESSAGES[kind])
    );
    this.name = 'CustomerMutationError';
    this.kind = kind;
    this.userErrors = userErrors;
    this.cause = cause;
  }
}
