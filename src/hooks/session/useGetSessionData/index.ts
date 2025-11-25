/**
 * Get Session Data Hook - SDK Integration
 *
 * This file re-exports useGetSessionData from the SDK.
 * All session management logic has been moved to @shopana/storefront-sdk
 *
 * @deprecated Use hooks from @shopana/storefront-sdk/modules/session/react instead
 */

// Re-export from SDK
export {
  useGetSessionData,
  type SessionData,
  type UseGetSessionDataProps,
} from '@shopana/storefront-sdk/modules/session/react/hooks';

// Default export for backward compatibility
import { useGetSessionData } from '@shopana/storefront-sdk/modules/session/react/hooks';
export default useGetSessionData;
