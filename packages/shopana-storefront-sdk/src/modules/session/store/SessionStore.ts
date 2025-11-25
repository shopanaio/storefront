import type { Session } from '../core/types';

/**
 * Session store interface - matches Zustand implementation
 * This is the same interface as in @src/store/sessionStore.ts
 */
export interface SessionStore {
  // State
  session: Session | null;

  // Actions
  setSession(session: Session | null): void;
  refreshSession(): void;
  setRefreshSession(fn: () => void): void;
}

/**
 * Session actions type - only methods, no state
 */
export type SessionActions = Omit<SessionStore, 'session'>;

/**
 * Store implementation interface for dependency injection
 */
export interface StoreImplementation<T> {
  getState(): T;
  setState(state: T | ((prev: T) => T)): void;
  subscribe(listener: (state: T) => void): () => void;
}
