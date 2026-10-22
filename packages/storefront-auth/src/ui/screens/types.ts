import type { AuthError } from '../../core/AuthError';

/**
 * Where the sign-in is shown. It changes texts and what is offered, never the logic:
 * - `store` — a card of the store (dialog or page);
 * - `checkoutGuest` — the checkout of a store that takes guest orders (a drawer);
 * - `checkoutRequired` — the checkout of a store that takes orders from accounts only (inline).
 */
export type AuthContext = 'store' | 'checkoutGuest' | 'checkoutRequired';

/** Why the buyer is asked to sign in again, shown over the first screen. */
export type IdentifyNotice =
  | 'sessionExpired'
  | 'socialCancelled'
  | 'socialFailed'
  | 'accountNotLinked';

export type OtpPurpose = 'signIn' | 'verifyEmail';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

/** Texts that depend on `context`. */
export function contextCopy(context: AuthContext) {
  return {
    identifyTitle:
      context === 'checkoutRequired' ? 'identify.titleRequired' : 'identify.title',
    identifySubtitle: (hasCode: boolean) =>
      context === 'checkoutRequired'
        ? 'identify.subtitleRequired'
        : hasCode
          ? 'identify.subtitle'
          : 'identify.subtitleNoCode',
    unavailable:
      context === 'checkoutGuest' ? 'alerts.unavailableGuest' : 'alerts.unavailable',
    accountsDisabled: `alerts.accountsDisabled.${context}`,
    /** A password account is offered on store pages only, never in the checkout. */
    offersPasswordSignUp: context === 'store',
  } as const;
}

/** An error of the last step that the screen shows as an alert; others go under fields. */
export const isFieldError = (error: AuthError | null) =>
  error?.code === 'invalidInput';
