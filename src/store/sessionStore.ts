/**
 * Session Store - SDK Integration
 *
 * Re-exports session store utilities from SDK.
 * Store should be created per-component tree, not as global singleton.
 */

// Re-export store creation function
export { createSessionStoreZustand } from '@shopana/storefront-sdk/modules/session/react/store/SessionStoreZustand';

// Re-export types
export type {
  SessionStore,
  SessionActions,
  StoreImplementation,
} from '@shopana/storefront-sdk/modules/session/store/SessionStore';

export type {
  Session,
} from '@shopana/storefront-sdk/modules/session/core/types';

export type {
  SessionStoreZustand,
} from '@shopana/storefront-sdk/modules/session/react/store/SessionStoreZustand';

// For backward compatibility
export type { SessionStore as SessionState } from '@shopana/storefront-sdk/modules/session/store/SessionStore';

// Backward compatibility exports
export { createSessionStoreZustand as createSessionStore } from '@shopana/storefront-sdk/modules/session/react/store/SessionStoreZustand';
export const defaultInitState = { session: null };
