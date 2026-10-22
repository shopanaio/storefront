import type { AuthErrorCode } from './types';

/** A sign-in step that did not succeed, with a code a form can show a message for. */
export class AuthError extends Error {
  constructor(
    readonly code: AuthErrorCode,
    message: string,
    readonly status: number,
    /** Seconds until the next attempt is accepted, for `rateLimited`. */
    readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export function isAuthError(value: unknown): value is AuthError {
  return value instanceof AuthError;
}
