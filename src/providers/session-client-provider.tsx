"use client";

import { type ReactNode, createContext, useRef } from "react";
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
  initialState?: Partial<SessionStore>;
}

export const SessionClientProvider = ({
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
