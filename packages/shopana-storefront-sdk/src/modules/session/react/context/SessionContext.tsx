'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { SessionStore } from '../../store/SessionStore';
import type { SessionStoreZustand } from '../store/SessionStoreZustand';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { ApplicationAuthConfig } from '../../../../graphql/apollo/types';
import { IamApplicationClient } from '../../core/IamApplicationClient';
import {
  storefrontSession,
  type BrowserSession,
  type StorefrontSessionClient,
} from '../../core/StorefrontSessionClient';
import {
  AUTH_EVENT_COOKIE,
  AUTH_RESULT_PARAM,
  parseAuthResult,
  readBrowserCookie,
  removeBrowserCookie,
  type AuthResult,
} from '../../core/sessionCookies';
import type { LoginMethod, Session } from '../../core/types';

/**
 * Session context value providing store and utilities
 */
export interface SessionContextValue {
  /**
   * Session store instance (Zustand vanilla store)
   */
  store: StoreApi<SessionStore>;

  /**
   * Zustand hook for accessing state with selectors
   * Use this in React components: useSessionStore(s => s.session)
   */
  useStore: UseBoundStore<StoreApi<SessionStore>>;
  /** Browser side of the storefront session server. */
  sessionClient: StorefrontSessionClient;
  /** IAM session endpoints; null when the store has no customer accounts. */
  iamClient: IamApplicationClient | null;
  /** Cart cookie the session server clears on sign-out (S5). */
  cartCookieName?: string;
}

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

/**
 * Props for SessionProvider
 */
export interface SessionProviderProps {
  children: ReactNode;
  /**
   * Session store - should be SessionStoreZustand object from createSessionStoreZustand()
   */
  store: SessionStoreZustand;
  applicationAuth?: ApplicationAuthConfig;
  cartCookieName?: string;
}

function toSession(session: BrowserSession): Session {
  return {
    user: session.user,
    expiresAt: session.expiresAt,
    ...(session.loginMethod ? { loginMethod: session.loginMethod } : {}),
  };
}

/**
 * Session Provider Component
 *
 * Mirrors the storefront session (kept by the session server in HttpOnly cookies) into the
 * session store, and marks a sign-in that has just come back from `/auth/callback` so the
 * account cart is attached (design F1).
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
  applicationAuth,
  cartCookieName,
}) => {
  const storeObject = storeProp.store;
  const iamClient = useMemo(
    () => (applicationAuth ? new IamApplicationClient(applicationAuth) : null),
    [applicationAuth]
  );

  React.useEffect(() => {
    const state = storeObject.getState();
    const unsubscribe = storefrontSession.subscribe((change) => {
      const actions = storeObject.getState();
      if (change.type === 'session')
        actions.setSession(toSession(change.session));
      else if (change.type === 'expired') actions.expireSession();
      else actions.setSession(null);
    });
    const load = () =>
      storefrontSession.load().catch(() => {
        // The session server could not reach IAM; the page keeps its current state.
      });
    state.setRefreshSession(() => {
      void load();
    });

    if (readBrowserCookie(AUTH_EVENT_COOKIE) === 'signed-in') {
      removeBrowserCookie(AUTH_EVENT_COOKIE);
      state.setSignInPending(true);
    }
    const url = new URL(window.location.href);
    if (url.searchParams.has(AUTH_RESULT_PARAM)) {
      state.setAuthResult(
        parseAuthResult(url.searchParams.get(AUTH_RESULT_PARAM))
      );
      url.searchParams.delete(AUTH_RESULT_PARAM);
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`
      );
    }

    if (storefrontSession.hasSession()) {
      void load();
    } else if (!state.session) {
      state.setSession(null);
    }
    return unsubscribe;
  }, [storeObject]);

  const value = useMemo<SessionContextValue>(
    () => ({
      store: storeObject,
      useStore: storeProp.useStore,
      sessionClient: storefrontSession,
      iamClient,
      cartCookieName,
    }),
    [storeObject, storeProp.useStore, iamClient, cartCookieName]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
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

export const useSessionStatus = () => {
  const useStore = useSessionStore();
  return useStore((state) => state.status);
};

/** Whether the session ended on the server while this page had it (S6). */
export const useSessionExpired = (): boolean => {
  const useStore = useSessionStore();
  return useStore((state) => state.expired);
};

/**
 * Why the last sign-in through the provider page did not complete (`cancelled`,
 * `accountNotLinked`, `failed`), or null. A form shows it once and calls `clear()`; a new
 * session clears it too.
 */
export const useAuthResult = (): {
  result: AuthResult | null;
  clear: () => void;
} => {
  const useStore = useSessionStore();
  const result = useStore((state) => state.authResult);
  const setAuthResult = useStore((state) => state.setAuthResult);
  const clear = React.useCallback(() => setAuthResult(null), [setAuthResult]);
  return { result, clear };
};

/**
 * The identifier the buyer signed in with (`email` or `phone`); null for an anonymous buyer or
 * a hosted sign-in.
 */
export const useLoginMethod = (): LoginMethod | null => {
  const useStore = useSessionStore();
  return useStore((state) => state.session?.loginMethod ?? null);
};

/** Whether a sign-in has just completed and the account cart is being attached. */
export const useSignInPending = (): boolean => {
  const useStore = useSessionStore();
  return useStore((state) => state.signInPending);
};
