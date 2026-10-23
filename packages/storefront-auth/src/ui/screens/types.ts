import type { AuthMethodTab } from '../AuthUIProvider';

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

/** The email waits for its link, the link was sent again, or the account was just created. */
export type PasswordNotice =
  | 'verificationLink'
  | 'verificationResent'
  | 'signInRequired';

export type OtpPurpose = 'signIn' | 'verifyEmail';

/**
 * What the buyer typed that outlives a screen: the way to get a code and the identifier. The
 * flow keeps one draft for all its screens, so the email typed on one is on the next; the
 * screens own the rest of their fields (passwords, names, the code).
 */
export interface AuthDraft {
  channel: AuthMethodTab;
  email: string;
  /** E.164, as the phone field gives it. */
  phone: string | undefined;
}

/** Changes some fields of the draft. */
export type AuthDraftChange = (patch: Partial<AuthDraft>) => void;

/** The draft of an identifier the buyer already gave (the checkout contact). */
export function draftOf(identifier?: {
  email?: string | null;
  phone?: string | null;
}): AuthDraft {
  return {
    channel: identifier?.email && !identifier.phone ? 'email' : 'phone',
    email: identifier?.email ?? '',
    phone: identifier?.phone ?? undefined,
  };
}

/** Texts that depend on `context`. */
export function contextCopy(context: AuthContext) {
  return {
    /** None in the account-only checkout: the sign-in sits under the contact section's title. */
    identifyTitle: context === 'checkoutRequired' ? null : 'identify.title',
    /** The line under the title; none over a code form. */
    identifySubtitle: (hasCode: boolean) =>
      context === 'checkoutRequired'
        ? 'identify.subtitleRequired'
        : hasCode
          ? null
          : 'identify.subtitleNoCode',
    unavailable:
      context === 'checkoutGuest'
        ? 'alerts.unavailableGuest'
        : 'alerts.unavailable',
    accountsDisabled: `alerts.accountsDisabled.${context}`,
  } as const;
}
