import { createStore } from 'zustand/vanilla';
import { create } from 'zustand';
import type { model } from "@shopana/storefront-sdk";

export interface Session {
  user: model.User | null;
  token?: string;
  expiresAt?: string;
}

export interface SessionState {
  session: Session | null;
  setSession: (session: Session | null) => void;
  refreshSession: () => void;
  setRefreshSession: (fn: () => void) => void;
}

export type SessionStore = SessionState;

export const defaultInitState: SessionState = {
  session: null,
  setSession: () => { },
  refreshSession: () => { },
  setRefreshSession: () => { },
};

export const createSessionStore = (initState: Partial<SessionState> = defaultInitState) => {
  return createStore<SessionStore>()((set) => ({
    ...defaultInitState,
    ...initState,
    setSession: (session) => set({ session }),
    refreshSession: () => { },
    setRefreshSession: (fn) => set({ refreshSession: fn }),
  }));
};

export const useSession = create<SessionStore>()((set) => ({
  ...defaultInitState,
  setSession: (session) => set({ session }),
  refreshSession: () => { },
  setRefreshSession: (fn) => set({ refreshSession: fn }),
}));
