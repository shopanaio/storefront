'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import type { ReactNode } from 'react';
import { useSessionStatus } from '@shopana/storefront-sdk/modules/session/react';
import type { SignInScreen } from '../core/types';

/**
 * Actions that need a signed-in buyer (add to the wishlist, answer a question, open the
 * account). Asked for without a session, the action is not run: it waits as a pending action
 * while the buyer signs in, and runs once the session is there — also after a social sign-in,
 * which leaves the page for the provider and comes back to it. Closing the sign-in drops it.
 *
 * A pending action is its `key` and a JSON payload, kept in `sessionStorage` for the tab: the
 * page the buyer comes back to has new closures, so the component that registered the key runs
 * it again from the payload.
 */

/** Values a pending action carries over a page load. */
export type AuthActionPayload =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly AuthActionPayload[]
  | { readonly [key: string]: AuthActionPayload };

interface PendingAuthAction {
  key: string;
  payload: AuthActionPayload;
  /** Page it was asked for on; it runs only there. */
  path: string;
  /** Epoch milliseconds. */
  at: number;
}

const STORAGE_KEY = 'shopana:pending-auth-action';
/** A sign-in that takes longer is a new visit: the action is dropped. */
const PENDING_TTL_MS = 15 * 60 * 1000;

/** Without `sessionStorage` (private mode, blocked storage) the action waits in memory. */
let memory: PendingAuthAction | null = null;

const currentPath = () =>
  typeof window === 'undefined' ? '' : window.location.pathname;

function writePending(action: PendingAuthAction | null): void {
  memory = action;
  try {
    if (action) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Kept in memory only.
  }
}

const isPending = (value: unknown): value is PendingAuthAction =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as PendingAuthAction).key === 'string' &&
  typeof (value as PendingAuthAction).path === 'string' &&
  typeof (value as PendingAuthAction).at === 'number';

function readPending(): PendingAuthAction | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const value: unknown = JSON.parse(stored);
      if (isPending(value)) return value;
      // Not one this code wrote: dropped.
      writePending(null);
      return null;
    }
  } catch {
    // Read from memory.
  }
  return memory;
}

/**
 * Takes the pending action of `key` asked for on this page, removing it; null when the pending
 * action is another one. One that expired or belongs to another page is dropped.
 */
function takePending(key: string): PendingAuthAction | null {
  const pending = readPending();
  if (!pending) return null;
  if (
    Date.now() - pending.at > PENDING_TTL_MS ||
    pending.path !== currentPath()
  ) {
    writePending(null);
    return null;
  }
  if (pending.key !== key) return null;
  writePending(null);
  return pending;
}

/** Drops the action waiting for a sign-in: the buyer closed the sign-in without signing in. */
export function discardPendingAuthAction(): void {
  writePending(null);
}

/** The sign-in an action asks for. */
export interface AuthSignInRequest {
  /** Screen it opens on; the first one when not given. */
  screen?: SignInScreen;
}

interface AuthActionContextValue {
  requestSignIn: (request: AuthSignInRequest) => void;
}

const AuthActionContext = createContext<AuthActionContextValue | null>(null);

/**
 * Opens the sign-in for the actions under it (`useAuthAction`): the store's dialog, a page of
 * its own. The sign-in dialog of this package (`AuthDialog`) drops the pending action when the
 * buyer closes it; a sign-in of its own calls `discardPendingAuthAction` for that.
 */
export const AuthActionProvider = ({
  requestSignIn,
  children,
}: {
  requestSignIn: (request: AuthSignInRequest) => void;
  children: ReactNode;
}) => {
  const requestRef = useRef(requestSignIn);
  useLayoutEffect(() => {
    requestRef.current = requestSignIn;
  });
  const value = useMemo<AuthActionContextValue>(
    () => ({ requestSignIn: (request) => requestRef.current(request) }),
    []
  );
  return (
    <AuthActionContext.Provider value={value}>
      {children}
    </AuthActionContext.Provider>
  );
};

export interface AuthActionOptions {
  /**
   * The store lets a guest do it too (a question of a guest): it runs at once without a
   * session. The value may change as the store's settings load.
   */
  guest?: boolean;
  /** Screen the sign-in opens on, e.g. `signUp` for "Create an account". */
  screen?: SignInScreen;
}

/**
 * An action that needs a signed-in buyer. The returned function runs `handler` at once with a
 * session; without one it keeps the action and asks for a sign-in (`AuthActionProvider`), and
 * `handler` runs with the same payload once the buyer is signed in. While the session is still
 * loading it does nothing, as the controls are not ready yet.
 *
 * `key` names what the action is done to, unique on the page (`question-answer:<id>`), so that
 * one component runs it; components whose handlers do the same with the payload (open the
 * account page) may share a key. `handler` acts on its payload, which is JSON, and handles its
 * own errors.
 */
export function useAuthAction<Payload extends AuthActionPayload = undefined>(
  key: string,
  handler: (payload: Payload) => void | Promise<void>,
  { guest = false, screen }: AuthActionOptions = {}
): (payload: Payload) => void {
  const status = useSessionStatus();
  const context = useContext(AuthActionContext);
  const handlerRef = useRef(handler);
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  // A pending action of this key runs once the buyer is signed in.
  useEffect(() => {
    if (status !== 'authenticated') return;
    const pending = takePending(key);
    if (pending) void handlerRef.current(pending.payload as Payload);
  }, [status, key]);

  return useCallback(
    (payload: Payload) => {
      if (status === 'authenticated' || guest) {
        void handlerRef.current(payload);
        return;
      }
      if (status === 'loading') return;
      writePending({ key, payload, path: currentPath(), at: Date.now() });
      if (!context && process.env.NODE_ENV !== 'production') {
        console.warn(
          `useAuthAction("${key}"): no AuthActionProvider opens the sign-in.`
        );
      }
      context?.requestSignIn({ screen });
    },
    [status, guest, key, screen, context]
  );
}
