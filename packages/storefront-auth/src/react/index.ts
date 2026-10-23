'use client';

/**
 * React hooks of the headless sign-in. They need the SDK `SessionProvider` above them.
 */
export {
  useAuth,
  type AuthFlowStep,
  type AuthOutcome,
  type OtpActions,
  type UseAuthResult,
} from './useAuth';
export { secondsUntil, useSecondsUntil } from './useSecondsUntil';
export {
  useAuthConfiguration,
  type AuthConfigurationState,
} from './useAuthConfiguration';
export {
  useAccountConnections,
  type UseAccountConnectionsResult,
} from './useAccountConnections';
export { useHeadlessAuthClient } from './useHeadlessAuthClient';

// Session state and sign-out, so a theme takes all of auth from one package.
export {
  useAuthResult,
  useIsAuthenticated,
  useLoginMethod,
  useSessionExpired,
  useSessionStatus,
  useSignInPending,
  useSignOut,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';

export { AuthError, isAuthError } from '../core/AuthError';
export {
  readConnectionResult,
  readEmailVerificationLink,
  readPasswordResetLink,
} from '../core/links';
export {
  DEFAULT_EMAIL_VERIFICATION_PATH,
  DEFAULT_PASSWORD_RESET_PATH,
} from '../core/types';
export type * from '../core/types';
