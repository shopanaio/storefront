/**
 * Headless storefront sign-in: framework-free browser client and the wire types.
 * React hooks live in `@shopana/storefront-auth/react`, route handlers in
 * `@shopana/storefront-auth/server`.
 */
export {
  HeadlessAuthClient,
  type HeadlessAuthClientOptions,
} from './core/HeadlessAuthClient';
export { AuthError, isAuthError } from './core/AuthError';
export {
  AUTH_ERROR_CODES,
  DEFAULT_EMAIL_VERIFICATION_PATH,
  DEFAULT_PASSWORD_RESET_PATH,
  HEADLESS_AUTH_BASE_PATH,
} from './core/types';
export {
  clearConnectionResult,
  clearEmailVerificationLink,
  clearPasswordResetLink,
  readConnectionResult,
  readEmailVerificationLink,
  readPasswordResetLink,
} from './core/links';
export type {
  AccountConnection,
  AccountConnections,
  AuthConfiguration,
  AuthErrorCode,
  AuthMethods,
  AuthStep,
  ConnectionErrorCode,
  ConnectionLinkInput,
  ConnectionResult,
  ConnectionUnlinkInput,
  EmailOtpSendInput,
  EmailOtpVerifyInput,
  EmailVerificationResendInput,
  HeadlessAction,
  OtpChannel,
  PasswordForgotInput,
  PasswordResetInput,
  PasswordSignInInput,
  PasswordSignUpInput,
  PhoneOtpSendInput,
  PhoneOtpVerifyInput,
  SignInScreen,
  SocialStartInput,
} from './core/types';
