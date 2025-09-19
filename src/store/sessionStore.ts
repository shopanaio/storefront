import { createStore } from 'zustand/vanilla';
import { create } from 'zustand';

export interface User {
  id: string;
  iid: string;
  email: string;
  phone?: string;
}

export interface Session {
  user: User | null;
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

export const createSessionStore = (initState: SessionState = defaultInitState) => {
  return createStore<SessionStore>()((set) => ({
    ...initState,
    setSession: (session) => set({ session }),
    refreshSession: () => { },
    setRefreshSession: (fn) => set({ refreshSession: fn }),
  }));
};

export const useSessionStore = create<SessionStore>()((set) => ({
  ...defaultInitState,
  setSession: (session) => set({ session }),
  refreshSession: () => { },
  setRefreshSession: (fn) => set({ refreshSession: fn }),
}));