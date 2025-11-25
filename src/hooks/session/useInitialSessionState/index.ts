/**
 * Initial Session State Hook - SDK Integration
 *
 * This file re-exports useInitialSessionState from the SDK.
 * All session management logic has been moved to @shopana/storefront-sdk
 *
 * @deprecated Use hooks from @shopana/storefront-sdk/modules/session/react instead
 */

// Re-export from SDK
export {
  useInitialSessionState,
  type UseInitialSessionStateProps,
  type InitialSessionState,
} from '@shopana/storefront-sdk/modules/session/react/hooks';

// Default export for backward compatibility
import { useInitialSessionState } from '@shopana/storefront-sdk/modules/session/react/hooks';
export default useInitialSessionState;
