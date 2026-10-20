import type { Session } from '../core/types';

/**
 * Session store interface - matches Zustand implementation
 * This is the same interface as in @src/store/sessionStore.ts
 */
export interface SessionStore {
  // State
  session: Session | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  /** S6: the session ended on the server while this page had it; the buyer signs in again. */
  expired: boolean;
  /**
   * A sign-in has just completed and the account cart is not attached to this browser yet
   * (claim of the guest cart or the saved account cart, design F1).
   */
  signInPending: boolean;

  // Actions
  setSession(session: Session | null): void;
  /** Ends the session because the server no longer has it. */
  expireSession(): void;
  setSignInPending(pending: boolean): void;
  refreshSession(): void;
  setRefreshSession(fn: () => void): void;
}

/**
 * Session actions type - only methods, no state
 */
export type SessionActions = Omit<
  SessionStore,
  'session' | 'status' | 'expired' | 'signInPending'
>;

/**
 * Store implementation interface for dependency injection
 */
export interface StoreImplementation<T> {
  getState(): T;
  setState(state: T | ((prev: T) => T)): void;
  subscribe(listener: (state: T) => void): () => void;
}
