import type { BrowserSession } from '@shopana/storefront-sdk/modules/session';

/**
 * Wire contract between the browser and the headless sign-in handlers at
 * `/auth/headless/[action]`. The handlers speak to IAM (`/headless/v1/*`) with the client
 * secret; the browser only sees these shapes.
 */

/** Sign-in methods the store has enabled, with the rules a form validates against. */
export interface AuthMethods {
  password: {
    signIn: boolean;
    signUp: boolean;
    /** A forgotten password can be reset by a link sent to the email. */
    reset: boolean;
    minLength: number;
    maxLength: number;
  };
  emailOtp: { signIn: boolean; signUp: boolean; codeLength: number };
  phoneOtp: { signIn: boolean; signUp: boolean; codeLength: number };
  social: readonly { provider: string; signUp: boolean }[];
}

export interface AuthConfiguration {
  methods: AuthMethods;
  emailVerificationRequired: boolean;
  /** How a new email is confirmed: a code entered on the page or a link in the email. */
  emailVerificationMethod: 'otp' | 'link';
  defaultLocale: string;
}

export type OtpChannel = 'email' | 'phone';

/** Outcome of a sign-in step. */
export type AuthStep =
  /** Signed in: the session cookies are set and the session is adopted by this tab. */
  | { type: 'completed'; session: BrowserSession }
  /** A code was sent; it can be resent after `resendAfter` seconds. */
  | {
      type: 'otpSent';
      channel: OtpChannel;
      resendAfter: number;
      expiresIn: number;
    }
  /**
   * The email must be confirmed first. With `otp` the form asks for the code sent to it
   * (`emailOtp.verify`); with `link` the buyer follows the link and signs in again.
   */
  | { type: 'verificationRequired'; method: 'otp' | 'link' }
  /** The account was created without a session: the buyer signs in now. */
  | { type: 'signInRequired' }
  /** A reset link was sent, if the email belongs to an account; it opens `resetPath`. */
  | { type: 'resetLinkSent' }
  /** The new password is set and every session ended; the buyer signs in with it. */
  | { type: 'passwordReset' }
  /** The verification email was sent again, if the email waits for it. */
  | { type: 'verificationSent' }
  /** The browser leaves for a social provider. */
  | { type: 'redirect'; url: string };

/**
 * Codes of a failed step:
 *
 * - `invalidCredentials` — wrong email or password, wrong or expired code, or a blocked
 *   account; never which one;
 * - `userExists`, `signUpDisabled`;
 * - `methodDisabled` — the method is disabled for this store;
 * - `invalidInput` — the input does not pass IAM validation (email, phone, password length);
 * - `expired` — the sign-in took too long, failed too often or was spent by a parallel step;
 *   it starts over from the first step;
 * - `rateLimited` — too many attempts; `retryAfter` says when to try again;
 * - `deliveryUnavailable` — the code could not be delivered;
 * - `unavailable` — IAM or the session server is unreachable;
 * - `disabled` — customer accounts are not configured for this storefront;
 * - `signInRequired` — an account action without a session; the buyer signs in;
 * - `reauthenticationRequired` — connections change only within 10 minutes of signing in;
 * - `lastLoginMethod` — the last way to sign in cannot be disconnected;
 * - `accountConflict` — the provider account is connected more than once or to someone else;
 * - `linkingFailed` — the provider could not be connected or disconnected.
 */
export const AUTH_ERROR_CODES = [
  'invalidCredentials',
  'userExists',
  'signUpDisabled',
  'methodDisabled',
  'invalidInput',
  'expired',
  'rateLimited',
  'deliveryUnavailable',
  'unavailable',
  'disabled',
  'signInRequired',
  'reauthenticationRequired',
  'lastLoginMethod',
  'accountConflict',
  'linkingFailed',
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export interface AuthErrorBody {
  error: AuthErrorCode;
  message: string;
  retryAfter?: number;
}

/**
 * Page of this storefront the email verification link opens, `/account/verify-email` by
 * default; it reads the outcome with `readEmailVerificationLink()`.
 */
interface VerifyPathInput {
  verifyPath?: string;
}

export interface PasswordSignInInput extends VerifyPathInput {
  email: string;
  password: string;
}

export interface PasswordSignUpInput extends VerifyPathInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface EmailOtpSendInput {
  email: string;
}

export interface EmailOtpVerifyInput {
  email: string;
  code: string;
}

export interface PhoneOtpSendInput {
  /** E.164, e.g. +380501234567. */
  phone: string;
}

export interface PhoneOtpVerifyInput {
  phone: string;
  code: string;
}

export interface PasswordForgotInput {
  email: string;
  /** Page of this storefront with the new-password form; `/account/reset-password` by default. */
  resetPath?: string;
}

export interface PasswordResetInput {
  /** `token` of the reset link, see `readPasswordResetLink()`. */
  token: string;
  password: string;
}

export interface EmailVerificationResendInput extends VerifyPathInput {
  email: string;
}

export interface SocialStartInput {
  provider: string;
  /** Path of this storefront to return to after the provider; the current page by default. */
  returnTo?: string;
}

/** Actions of the headless handlers and their request bodies. */
export interface HeadlessActionInputs {
  'password-sign-in': PasswordSignInInput;
  'password-sign-up': PasswordSignUpInput;
  'email-otp-send': EmailOtpSendInput;
  'email-otp-verify': EmailOtpVerifyInput;
  'phone-otp-send': PhoneOtpSendInput;
  'phone-otp-verify': PhoneOtpVerifyInput;
  'social-start': SocialStartInput;
  'password-forgot': PasswordForgotInput;
  'password-reset': PasswordResetInput;
  'email-verification-resend': EmailVerificationResendInput;
}

export type HeadlessAction = keyof HeadlessActionInputs;

/** A social provider as the account page shows it. */
export interface AccountConnection {
  provider: string;
  /** Enabled for this store; a disabled provider is listed while it is still connected. */
  enabled: boolean;
  status: 'connected' | 'notConnected' | 'conflict';
}

export interface AccountConnections {
  providers: readonly AccountConnection[];
  /** Connections change only within 10 minutes of signing in; sign in again first. */
  reauthenticationRequired: boolean;
}

export type ConnectionErrorCode =
  | 'accessDenied'
  | 'emailMismatch'
  | 'accountConflict'
  | 'reauthenticationRequired'
  | 'linkingFailed';

/** Outcome of connecting a provider, read from the page the browser returned to. */
export type ConnectionResult =
  | { provider: string; linked: true }
  | { provider: string; linked: false; error: ConnectionErrorCode };

export interface ConnectionLinkInput {
  provider: string;
  /** Path of this storefront to return to from the provider; the current page by default. */
  returnTo?: string;
}

export interface ConnectionUnlinkInput {
  provider: string;
}

/** Account actions of the headless handlers and their request bodies. */
export interface AccountActionInputs {
  'connection-link': ConnectionLinkInput;
  'connection-unlink': ConnectionUnlinkInput;
}

export type AccountAction = keyof AccountActionInputs;

/** Default page of the new-password form a reset link opens. */
export const DEFAULT_PASSWORD_RESET_PATH = '/account/reset-password';

/** Default page the email verification link opens. */
export const DEFAULT_EMAIL_VERIFICATION_PATH = '/account/verify-email';

/** Base path of the headless handlers generated by the storefront runtime. */
export const HEADLESS_AUTH_BASE_PATH = '/auth/headless';
