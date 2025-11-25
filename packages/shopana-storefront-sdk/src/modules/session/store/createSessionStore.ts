import type { SessionStore, StoreImplementation } from './SessionStore';
import type { Session } from '../core/types';

/**
 * Default initial state for session store
 */
export const defaultSessionState: SessionStore = {
  session: null,
  setSession: () => {},
  refreshSession: () => {},
  setRefreshSession: () => {},
};

/**
 * Creates a session store instance
 * This is framework-agnostic and can be used with any store implementation (Zustand, Redux, etc.)
 *
 * @param storeImpl - Store implementation (Zustand, Redux, etc.)
 * @param initialSession - Optional initial session state
 * @returns Session store instance
 */
export function createSessionStore(
  storeImpl: StoreImplementation<SessionStore>,
  initialSession?: Session | null
): SessionStore {
  const initialState: SessionStore = {
    ...defaultSessionState,
    session: initialSession || null,
  };

  // Set initial state
  storeImpl.setState(initialState);

  // Define actions
  const setSession = (session: Session | null) => {
    storeImpl.setState((state) => ({
      ...state,
      session,
    }));
  };

  const refreshSession = () => {
    const state = storeImpl.getState();
    if (state.refreshSession) {
      state.refreshSession();
    }
  };

  const setRefreshSession = (fn: () => void) => {
    storeImpl.setState((state) => ({
      ...state,
      refreshSession: fn,
    }));
  };

  // Return store API
  return {
    get session() {
      return storeImpl.getState().session;
    },
    setSession,
    refreshSession,
    setRefreshSession,
  };
}
