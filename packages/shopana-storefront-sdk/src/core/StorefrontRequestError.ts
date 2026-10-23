/** Business error the Storefront API returned in `userErrors`. */
export interface StorefrontUserError<TCode extends string = string> {
  readonly code: TCode;
  readonly message: string;
  readonly field: readonly string[] | null;
}

/**
 * Why a storefront form request failed:
 * - `userErrors`: the API rejected the input, see `userErrors`;
 * - `request`: the request itself failed (network, GraphQL errors), see `cause`;
 * - `emptyPayload`: the API answered without errors and without a result.
 */
export type StorefrontRequestErrorKind =
  | 'userErrors'
  | 'request'
  | 'emptyPayload';

const DEFAULT_MESSAGES: Record<StorefrontRequestErrorKind, string> = {
  userErrors: 'The Storefront API rejected the request',
  request: 'The Storefront API request failed',
  emptyPayload: 'The Storefront API returned no result',
};

/**
 * The error the buyer-facing form mutations of the SDK (newsletter, call-back request) reject
 * with. Codes of `userErrors` are stable: a theme maps them to its own messages.
 */
export class StorefrontRequestError<
  TCode extends string = string,
> extends Error {
  readonly kind: StorefrontRequestErrorKind;
  /** Rejected fields; empty unless `kind` is `userErrors`. */
  readonly userErrors: readonly StorefrontUserError<TCode>[];
  /** The underlying failure of a `request` error. */
  readonly cause: unknown;

  constructor(
    kind: StorefrontRequestErrorKind,
    {
      userErrors = [],
      cause,
    }: {
      userErrors?: readonly StorefrontUserError<TCode>[];
      cause?: unknown;
    } = {}
  ) {
    super(
      userErrors[0]?.message ??
        (cause instanceof Error ? cause.message : DEFAULT_MESSAGES[kind])
    );
    this.name = 'StorefrontRequestError';
    this.kind = kind;
    this.userErrors = userErrors;
    this.cause = cause;
  }

  /** True when the API rejected the request with the given code. */
  hasCode(code: TCode): boolean {
    return this.userErrors.some((error) => error.code === code);
  }
}

export function isStorefrontRequestError(
  error: unknown
): error is StorefrontRequestError {
  return error instanceof StorefrontRequestError;
}

/**
 * Runs a mutation and unwraps its payload: rejects with `StorefrontRequestError` on a failed
 * request, on user errors and on a payload without a result.
 */
export async function runStorefrontMutation<
  TPayload extends {
    readonly userErrors: readonly {
      readonly code?: string | null;
      readonly message: string;
      readonly field?: readonly string[] | null;
    }[];
  },
  TResult,
  TCode extends string = string,
>(
  request: () => Promise<TPayload | null | undefined>,
  result: (payload: TPayload) => TResult | null | undefined
): Promise<TResult> {
  let payload: TPayload | null | undefined;
  try {
    payload = await request();
  } catch (cause) {
    throw new StorefrontRequestError<TCode>('request', { cause });
  }
  if (!payload) throw new StorefrontRequestError<TCode>('emptyPayload');
  if (payload.userErrors.length) {
    throw new StorefrontRequestError<TCode>('userErrors', {
      userErrors: payload.userErrors.map((error) => ({
        code: (error.code ?? '') as TCode,
        message: error.message,
        field: error.field ?? null,
      })),
    });
  }
  const value = result(payload);
  if (value == null) throw new StorefrontRequestError<TCode>('emptyPayload');
  return value;
}
