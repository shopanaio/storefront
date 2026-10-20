import type { SessionStore, StoreImplementation } from './SessionStore';
import type { Session } from '../core/types';

/**
 * Default initial state for session store
 */
export const defaultSessionState: SessionStore = {
  session: null,
  status: 'loading',
  expired: false,
  signInPending: false,
  setSession: () => {},
  expireSession: () => {},
  setSignInPending: () => {},
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
    status: initialSession ? 'authenticated' : 'loading',
  };

  // Set initial state
  storeImpl.setState(initialState);

  // Define actions
  const setSession = (session: Session | null) => {
    storeImpl.setState((state) => ({
      ...state,
      session,
      status: session ? 'authenticated' : 'anonymous',
      expired: session ? false : state.expired,
    }));
  };

  const expireSession = () => {
    storeImpl.setState((state) => ({
      ...state,
      session: null,
      status: 'anonymous',
      expired: true,
      signInPending: false,
    }));
  };

  const setSignInPending = (signInPending: boolean) => {
    storeImpl.setState((state) => ({ ...state, signInPending }));
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
    get status() {
      return storeImpl.getState().status;
    },
    get expired() {
      return storeImpl.getState().expired;
    },
    get signInPending() {
      return storeImpl.getState().signInPending;
    },
    setSession,
    expireSession,
    setSignInPending,
    refreshSession,
    setRefreshSession,
  };
}
