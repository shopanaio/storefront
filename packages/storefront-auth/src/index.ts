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
export { AUTH_ERROR_CODES, HEADLESS_AUTH_BASE_PATH } from './core/types';
export type {
  AuthConfiguration,
  AuthErrorCode,
  AuthMethods,
  AuthStep,
  EmailOtpSendInput,
  EmailOtpVerifyInput,
  HeadlessAction,
  OtpChannel,
  PasswordSignInInput,
  PasswordSignUpInput,
  PhoneOtpSendInput,
  PhoneOtpVerifyInput,
  SocialStartInput,
} from './core/types';
