'use client';

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { SessionStore } from '../../store/SessionStore';
import type { SessionStoreZustand } from '../store/SessionStoreZustand';
import type { UseBoundStore, StoreApi } from 'zustand';

/**
 * Session context value providing store and utilities
 */
export interface SessionContextValue {
  /**
   * Session store instance (Zustand vanilla store)
   */
  store: SessionStore;

  /**
   * Zustand hook for accessing state with selectors
   * Use this in React components: useSessionStore(s => s.session)
   */
  useStore: UseBoundStore<StoreApi<SessionStore>>;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export interface SessionContextProviderProps {
  children: ReactNode;
  store: StoreApi<SessionStore>;
  useStore: UseBoundStore<StoreApi<SessionStore>>;
}

/**
 * Internal Session Context Provider
 * Provides session store to child components
 *
 * @internal This is used by the main SessionProvider
 */
export function SessionContextProvider({
  children,
  store,
  useStore,
}: SessionContextProviderProps) {
  const value = useMemo<SessionContextValue>(
    () => ({
      store: store as any as SessionStore,
      useStore,
    }),
    [store, useStore]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * Props for SessionProvider
 */
export interface SessionProviderProps {
  children: ReactNode;
  /**
   * Session store - should be SessionStoreZustand object from createSessionStoreZustand()
   */
  store: SessionStoreZustand;
}

/**
 * Session Provider Component
 *
 * Provides session state management with Zustand store.
 * Use this provider at the root of your app to enable session hooks.
 *
 * @example
 * ```tsx
 * import { SessionProvider, createSessionStoreZustand } from '@shopana/storefront-sdk/modules/session/react';
 *
 * const sessionStore = createSessionStoreZustand();
 *
 * function App() {
 *   return (
 *     <SessionProvider store={sessionStore}>
 *       {children}
 *     </SessionProvider>
 *   );
 * }
 * ```
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
  store: storeProp,
}) => {
  // Extract store and useStore from prop
  const { storeObject, useStoreHook } = useMemo(() => {
    return {
      storeObject: storeProp.store,
      useStoreHook: storeProp.useStore,
    };
  }, [storeProp]);

  return (
    <SessionContextProvider store={storeObject} useStore={useStoreHook}>
      {children}
    </SessionContextProvider>
  );
};

/**
 * Hook to access full session context
 * Provides store and utilities
 *
 * @throws Error if used outside SessionProvider
 */
export function useSessionContext(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider');
  }
  return context;
}

/**
 * Hook to access session store (Zustand hook)
 * Returns the Zustand hook directly for use with selectors
 *
 * @example
 * ```tsx
 * // Select only session data
 * const session = useSessionStore()(s => s.session);
 *
 * // Select user
 * const user = useSessionStore()(s => s.session?.user);
 *
 * // Or save to variable first
 * const useStore = useSessionStore();
 * const session = useStore(s => s.session);
 * ```
 *
 * @throws Error if used outside SessionProvider
 */
export function useSessionStore() {
  const { useStore } = useSessionContext();
  return useStore;
}

/**
 * Hook to get session data
 * Shorthand for useSessionStore()(state => state.session)
 *
 * @returns Current session or null
 */
export const useSession = () => {
  const useStore = useSessionStore();
  return useStore((state) => state.session);
};

/**
 * Hook to get current user
 * Shorthand for useSessionStore()(state => state.session?.user)
 *
 * @returns Current user or null
 */
export const useUser = () => {
  const useStore = useSessionStore();
  return useStore((state) => state.session?.user ?? null);
};

/**
 * Hook to check if user is authenticated
 *
 * @returns True if user is logged in
 */
export const useIsAuthenticated = (): boolean => {
  const useStore = useSessionStore();
  return useStore((state) => !!state.session?.user);
};
