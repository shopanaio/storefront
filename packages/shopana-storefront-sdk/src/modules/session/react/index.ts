/**
 * Session React Module
 *
 * React-specific session functionality including hooks, context, and providers
 */

// Context and store
export {
  SessionProvider,
  useSessionContext,
  useSessionStore,
  useSession,
  useUser,
  useIsAuthenticated,
  type SessionProviderProps,
  type SessionContextValue,
} from './context/SessionContext';

// Hooks
export * from './hooks';

// Store (Zustand)
export {
  createSessionStoreVanilla,
  createSessionStoreZustand,
  defaultSessionState,
  type SessionStoreZustand,
} from './store/SessionStoreZustand';
