/**
 * Session Hook - SDK Integration
 *
 * This file re-exports session hooks from the SDK.
 * All session management logic has been moved to @shopana/storefront-sdk
 *
 * @deprecated Use hooks from @shopana/storefront-sdk/modules/session/react instead
 */

// Re-export from SDK with same API
export {
  useSessionStore as useSession,
  useSession as useSessionData,
  useUser,
  useIsAuthenticated,
} from '@shopana/storefront-sdk/modules/session/react';
