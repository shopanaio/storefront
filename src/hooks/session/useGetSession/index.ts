/**
 * Get Session Hook - SDK Integration
 *
 * This file re-exports useGetSession from the SDK.
 * All session management logic has been moved to @shopana/storefront-sdk
 *
 * @deprecated Use hooks from @shopana/storefront-sdk/modules/session/react instead
 */

// Re-export from SDK
export {
  useGetSession,
  useGetSessionPreloaded,
  useGetSessionQuery,
} from '@shopana/storefront-sdk/modules/session/react/hooks';

export interface GetSessionInput {
  customerAccessToken: string;
}

// Default export for backward compatibility
import { useGetSession } from '@shopana/storefront-sdk/modules/session/react/hooks';
export default {
  useGetSession,
  useGetSessionPreloaded: useGetSession,
};