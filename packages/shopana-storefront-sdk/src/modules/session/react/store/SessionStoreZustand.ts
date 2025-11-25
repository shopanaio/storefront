import { createStore } from 'zustand/vanilla';
import { create } from 'zustand';
import type { SessionStore } from '../../store/SessionStore';
import type { Session } from '../../core/types';
import type { UseBoundStore, StoreApi } from 'zustand';

/**
 * Default initial state for session store
 */
export const defaultSessionState: Partial<SessionStore> = {
  session: null,
  refreshSession: () => {},
};

/**
 * Creates a Zustand vanilla session store instance
 *
 * @param initialSession - Optional initial session state
 * @returns Zustand store instance
 */
export const createSessionStoreVanilla = (initialSession?: Session | null) => {
  return createStore<SessionStore>()((set) => ({
    session: initialSession || null,
    setSession: (session) => set({ session }),
    refreshSession: () => {},
    setRefreshSession: (fn) => set({ refreshSession: fn }),
  }));
};

/**
 * Session store Zustand type (with store and useStore)
 */
export interface SessionStoreZustand {
  store: ReturnType<typeof createSessionStoreVanilla>;
  useStore: UseBoundStore<StoreApi<SessionStore>>;
}

/**
 * Creates a Zustand session store with React hook
 *
 * @param initialSession - Optional initial session state
 * @returns Object with store and useStore hook
 */
export const createSessionStoreZustand = (initialSession?: Session | null): SessionStoreZustand => {
  const store = createSessionStoreVanilla(initialSession);

  // Create a Zustand hook using create() from the vanilla store
  const useStore = create(() => store.getState());

  // Subscribe vanilla store changes to the React store
  store.subscribe((state) => {
    useStore.setState(state);
  });

  return {
    store,
    useStore,
  };
};

/**
 * Global session store instance (client-side only)
 * This is a singleton for use outside of React context
 */
export const useSession = create<SessionStore>()((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  refreshSession: () => {},
  setRefreshSession: (fn) => set({ refreshSession: fn }),
}));
