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
  useSessionStatus,
  useSessionExpired,
  useSignInPending,
  useAuthResult,
  useLoginMethod,
  type SessionProviderProps,
  type SessionContextValue,
} from './context/SessionContext';

// Components
export {
  ClosedPageGuard,
  type ClosedPageGuardProps,
} from './components/ClosedPageGuard';

// Hooks
export * from './hooks';

// Store (Zustand)
export {
  createSessionStoreVanilla,
  createSessionStoreZustand,
  defaultSessionState,
  type SessionStoreZustand,
} from './store/SessionStoreZustand';
