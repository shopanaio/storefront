'use client';

// The one place that wraps React's store hook and zustand's binding (see eslint.config.mjs).
/* eslint-disable no-restricted-imports */
import {
  startTransition,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useSyncExternalStore,
} from 'react';
import type { create as zustandCreate } from 'zustand';
import {
  createStore,
  type StateCreator,
  type StoreApi,
} from 'zustand/vanilla';
/* eslint-enable no-restricted-imports */

/**
 * Reading a store from React without React's own `useSyncExternalStore`: that hook renders a
 * component again at once (a synchronous render) when the store changed after the server's
 * render, and a page hydrating in slices then hydrates what is left in one long task. Here a
 * component shows the server's value until it has hydrated, then the store's value in a
 * transition; a store update shows at once only when the user's input made it.
 */

const subscribeNothing = () => () => {};
const sameValue = () => 0;

/**
 * Whether this render hydrates the server's HTML (or renders on the server): React reads the
 * server snapshot of a store then, the client snapshot otherwise. Both return the same value,
 * so React finds nothing changed after the commit.
 */
function useHydrating(): boolean {
  let client = false;
  useSyncExternalStore(
    subscribeNothing,
    () => {
      client = true;
      return 0;
    },
    sameValue
  );
  return !client;
}

/** Events whose updates the user waits to see: everything else renders in a transition. */
const INPUT_EVENTS = new Set([
  'beforeinput',
  'change',
  'click',
  'compositionend',
  'contextmenu',
  'dblclick',
  'focusin',
  'focusout',
  'input',
  'keydown',
  'keyup',
  'pointerdown',
  'pointerup',
  'submit',
  'touchend',
  'touchstart',
]);

function deliver(update: () => void) {
  if (INPUT_EVENTS.has(window.event?.type ?? '')) update();
  else startTransition(update);
}

/**
 * `useSyncExternalStore` for the storefront: the same arguments and value, without the
 * synchronous render of a store that changed while the page hydrates.
 */
export function useExternalStore<T>(
  subscribe: (onChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot: () => T
): T {
  // The hydration pass shows the server's value; any later render reads the store, as
  // `useSyncExternalStore` does.
  const value = useHydrating() ? getServerSnapshot() : getSnapshot();
  const [, changed] = useReducer((count: number) => count + 1, 0);
  const rendered = useRef({ value, getSnapshot });
  useEffect(() => {
    rendered.current = { value, getSnapshot };
    // A hydrated value that is no longer the store's, or a store that changed before this
    // commit: the subscription below hears only what changes after it.
    if (!Object.is(getSnapshot(), value)) deliver(changed);
  });
  useEffect(
    () =>
      subscribe(() => {
        const { value: shown, getSnapshot: read } = rendered.current;
        if (!Object.is(read(), shown)) deliver(changed);
      }),
    [subscribe]
  );
  return value;
}

const identity = <T>(value: T) => value;

/** zustand's `useStore` on `useExternalStore`. */
export function useStore<S>(api: StoreApi<S>): S;
export function useStore<S, U>(api: StoreApi<S>, selector: (state: S) => U): U;
export function useStore<S, U>(
  api: StoreApi<S>,
  selector: (state: S) => U = identity as (state: S) => U
): U {
  return useExternalStore(
    api.subscribe,
    useCallback(() => selector(api.getState()), [api, selector]),
    useCallback(() => selector(api.getInitialState()), [api, selector])
  );
}

const createImpl = <T>(createState: StateCreator<T, [], []>) => {
  const api = createStore(createState);
  const useBoundStore = <U>(selector?: (state: T) => U) =>
    useStore(api, selector ?? (identity as (state: T) => U));
  Object.assign(useBoundStore, api);
  return useBoundStore;
};

/** zustand's `create`, its hooks reading the store with `useExternalStore`. */
export const create = ((createState?: StateCreator<unknown, [], []>) =>
  createState
    ? createImpl(createState)
    : createImpl) as unknown as typeof zustandCreate;
