/** `12:00`, `00:45`: when a rate-limited attempt is accepted again. */
export function formatWait(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  return `${String(minutes).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** `0:42`: when a code can be sent again. */
export function formatResend(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** First letter of the buyer's name or email for the avatar, if known. */
export function initialOf(
  user: { firstName?: string | null; email?: string | null } | null | undefined
): string | null {
  const source = user?.firstName?.trim() || user?.email?.trim() || '';
  return source ? source[0]!.toLocaleUpperCase() : null;
}
