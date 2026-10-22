import type { ConnectionErrorCode, ConnectionResult } from './types';

/**
 * Pages the browser reaches from IAM: the new-password page of a reset link, the page of an
 * email verification link, and the page a provider connection returns to. IAM puts the outcome
 * into the query.
 */

const CONNECTION_ERRORS: Record<string, ConnectionErrorCode> = {
  access_denied: 'accessDenied',
  email_mismatch: 'emailMismatch',
  account_conflict: 'accountConflict',
  reauthentication_required: 'reauthenticationRequired',
  linking_failed: 'linkingFailed',
};

const CONNECTION_PARAMS = [
  'provider',
  'connection',
  'connection_error',
] as const;

/**
 * The reset token of the new-password page, or `expired` when IAM found the link invalid or
 * spent; null on a page opened without a reset link.
 */
export function readPasswordResetLink(
  search: string = location.search
): { token: string } | { error: 'expired' } | null {
  const query = new URLSearchParams(search);
  if (query.has('error')) return { error: 'expired' };
  const token = query.get('token');
  return token ? { token } : null;
}

/**
 * Removes the reset token from the address bar once read, so it does not stay in the history,
 * the `Referer` of the next requests or analytics.
 */
export function clearPasswordResetLink(): void {
  const url = new URL(location.href);
  if (!url.searchParams.has('token')) return;
  url.searchParams.delete('token');
  history.replaceState(
    history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
}

/**
 * Outcome of an email verification link: `verified`, or `expired` when IAM found the link
 * invalid or spent; null on a page opened without a verification link.
 */
export function readEmailVerificationLink(
  search: string = location.search
): { verified: true } | { error: 'expired' } | null {
  const query = new URLSearchParams(search);
  if (query.get('email_verified') === 'true') return { verified: true };
  if (query.has('error')) return { error: 'expired' };
  return null;
}

/** Outcome of connecting a provider on the page the browser returned to, if any. */
export function readConnectionResult(
  search: string = location.search
): ConnectionResult | null {
  const query = new URLSearchParams(search);
  const provider = query.get('provider');
  if (!provider) return null;
  if (query.get('connection') === 'linked') return { provider, linked: true };
  const error = query.get('connection_error');
  if (error === null) return null;
  return {
    provider,
    linked: false,
    error: CONNECTION_ERRORS[error] ?? 'linkingFailed',
  };
}

/** Removes the connection outcome from the address bar, so a reload does not show it again. */
export function clearConnectionResult(): void {
  const url = new URL(location.href);
  CONNECTION_PARAMS.forEach((name) => url.searchParams.delete(name));
  history.replaceState(
    history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
}
