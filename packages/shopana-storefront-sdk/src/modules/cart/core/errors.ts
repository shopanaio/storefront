import { CombinedGraphQLErrors, CombinedProtocolErrors } from '@apollo/client';
import { isMutationSuperseded } from './utils/mutationQueue';

/** Business error the checkout API returned in `userErrors`. */
export interface CartUserError {
  readonly code: string;
  readonly message: string;
  readonly field: readonly string[] | null;
  readonly retryable: boolean;
}

/**
 * Why a cart write failed:
 * - `user` — the API rejected the input; `userErrors` say why;
 * - `graphql` — the API answered with GraphQL errors or without the checkout;
 * - `network` — the request did not complete;
 * - `superseded` — a newer write of the same resource replaced this one before it was sent.
 */
export type CartMutationErrorKind =
  | 'user'
  | 'network'
  | 'graphql'
  | 'superseded';

/** The only rejection of a cart mutation hook. */
export class CartMutationError extends Error {
  readonly kind: CartMutationErrorKind;
  readonly userErrors: readonly CartUserError[];
  /** The underlying failure; null for business errors and an empty API answer. */
  readonly cause: Error | null;

  constructor(
    kind: CartMutationErrorKind,
    options: {
      message?: string;
      userErrors?: readonly CartUserError[];
      cause?: Error | null;
    } = {}
  ) {
    const userErrors = options.userErrors ?? [];
    super(
      options.message ??
        userErrors[0]?.message ??
        options.cause?.message ??
        'Cart mutation failed'
    );
    this.name = 'CartMutationError';
    this.kind = kind;
    this.userErrors = userErrors;
    this.cause = options.cause ?? null;
  }
}

export function isCartMutationError(
  error: unknown
): error is CartMutationError {
  return error instanceof CartMutationError;
}

/** Business errors of a mutation payload as a `user` error. */
export function cartUserError(
  userErrors: ReadonlyArray<{
    readonly code: string;
    readonly message: string;
    readonly field?: readonly string[] | null;
    readonly retryable: boolean;
  }>
): CartMutationError {
  return new CartMutationError('user', {
    userErrors: userErrors.map((error) => ({
      code: error.code,
      message: error.message,
      field: error.field ?? null,
      retryable: error.retryable,
    })),
  });
}

/** A payload without the checkout and without `userErrors`. */
export function missingCheckoutError(operation: string): CartMutationError {
  return new CartMutationError('graphql', {
    message: `${operation} returned no checkout`,
  });
}

/** Classifies any failure of a cart write. */
export function toCartMutationError(error: unknown): CartMutationError {
  if (isCartMutationError(error)) return error;
  if (isMutationSuperseded(error)) {
    return new CartMutationError('superseded', { cause: error });
  }
  if (CombinedGraphQLErrors.is(error) || CombinedProtocolErrors.is(error)) {
    return new CartMutationError('graphql', { cause: error });
  }
  return new CartMutationError('network', {
    cause: error instanceof Error ? error : new Error(String(error)),
  });
}

/**
 * Calls the callbacks of a cart write and makes `CartMutationError` its only rejection.
 */
export function settleCartMutation<T>(
  write: Promise<T>,
  options?: {
    onSuccess?: (result: T) => void;
    onError?: (error: CartMutationError) => void;
  }
): Promise<T> {
  return write.then(
    (result) => {
      options?.onSuccess?.(result);
      return result;
    },
    (error: unknown) => {
      const cartError = toCartMutationError(error);
      options?.onError?.(cartError);
      throw cartError;
    }
  );
}
