"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";
import {
  type SessionStore,
  createSessionStore,
  defaultInitState,
} from "@src/store/sessionStore";

export type SessionStoreApi = ReturnType<typeof createSessionStore>;

export const SessionStoreContext = createContext<SessionStoreApi | undefined>(
  undefined
);

export interface SessionStoreProviderProps {
  children: ReactNode;
  initialState?: SessionStore;
}

export const SessionStoreProvider = ({
  children,
  initialState,
}: SessionStoreProviderProps) => {
  const storeRef = useRef<SessionStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createSessionStore(initialState || defaultInitState);
  }

  return (
    <SessionStoreContext.Provider value={storeRef.current}>
      {children}
    </SessionStoreContext.Provider>
  );
};

export const useSessionStore = <T,>(
  selector: (store: SessionStore) => T
): T => {
  const sessionStoreContext = useContext(SessionStoreContext);
  if (!sessionStoreContext) {
    throw new Error(`useSessionStore must be used within SessionStoreProvider`);
  }
  return useStore(sessionStoreContext, selector);
};
