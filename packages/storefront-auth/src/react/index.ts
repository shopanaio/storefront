'use client';

/**
 * React hooks of the headless sign-in. They need the SDK `SessionProvider` above them.
 */
export {
  useAuth,
  type AuthFlowStep,
  type OtpActions,
  type UseAuthResult,
} from './useAuth';
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
  useIsAuthenticated,
  useSessionStatus,
  useSignInPending,
  useSignOut,
  useUser,
} from '@shopana/storefront-sdk/modules/session/react';

export { AuthError, isAuthError } from '../core/AuthError';
export { readConnectionResult, readPasswordResetLink } from '../core/links';
export { DEFAULT_PASSWORD_RESET_PATH } from '../core/types';
export type * from '../core/types';
