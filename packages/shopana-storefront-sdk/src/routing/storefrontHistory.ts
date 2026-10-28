import {
  createBrowserHistory,
  type HistoryLocation,
  type RouterHistory,
} from '@tanstack/history';
import type { HistoryGate } from './historyGate';

/**
 * The browser history of the storefront: TanStack history, the only owner of
 * `window.history`. The framework router (Next's app router) is cut off from it by the gate
 * (historyGate): its history writes come here and become entries only when they move to
 * another address, and it never hears back/forward. Next renders the first page on the
 * server; the pages the history moves to render on the client (see the runtime's
 * RuntimeClientPage), and the history never follows Next's state.
 *
 * TanStack history gets a window whose `history` writes natively and whose popstate
 * listeners are the gate's, so its own patch and listener sit past the gate too.
 */

/**
 * Keys of an entry's state that belong to that one move: TanStack history's own, and the
 * scroll option of a link or router call. The rest is the app's and carries over to entries
 * others write from it.
 */
const MOVE_STATE_KEYS = new Set(['key', '__TSR_key', '__TSR_index', 'scroll']);

let history: RouterHistory | null = null;
let frameworkWrite = false;
/**
 * The address the framework router last wrote (at first, the page it rendered). It writes its
 * address again on every state change of its own; while an app moves pages itself (the
 * mobile stack) that address is long gone, and writing it again is no move.
 */
let frameworkHref: string | null = null;

/** Next's app router marks its writes with `__NA` (`__N` the pages router's). */
const isFrameworkWrite = (data: unknown) => {
  const record = data as Record<string, unknown> | null;
  return Boolean(record && typeof record === 'object' && (record.__NA || record.__N));
};

const appState = (location: HistoryLocation) => {
  const state: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(location.state)) {
    if (!MOVE_STATE_KEYS.has(key)) state[key] = value;
  }
  return state;
};

const hasEntryKey = (state: unknown) =>
  typeof (state as { __TSR_key?: unknown } | null)?.__TSR_key === 'string';

/**
 * An entry the browser wrote itself: a jump to an anchor (`#reviews`) adds one without state,
 * past `pushState`. It becomes the next entry of the history, with the app's state of the
 * entry it was jumped from, so the history counts it as a step forward on the same page.
 */
const adoptBrowserEntry = (from: HistoryLocation) => {
  const key = Math.random().toString(36).slice(2, 10);
  History.prototype.replaceState.call(window.history, {
    ...appState(from),
    key,
    __TSR_key: key,
    __TSR_index: from.state.__TSR_index + 1,
  }, '');
};

/** `window` as TanStack history sees it: native history, popstate through the gate. */
const createHistoryWindow = (gate: HistoryGate, current: () => HistoryLocation | null) => {
  const nativeHistory = {
    get state() {
      return window.history.state;
    },
    get length() {
      return window.history.length;
    },
    pushState: (state: unknown, unused: string, url?: string | URL | null) =>
      History.prototype.pushState.call(window.history, state, unused, url),
    replaceState: (state: unknown, unused: string, url?: string | URL | null) =>
      History.prototype.replaceState.call(window.history, state, unused, url),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    go: (delta: number) => window.history.go(delta),
  };
  return {
    history: nativeHistory,
    location: window.location,
    document: window.document,
    addEventListener(
      type: string,
      listener: EventListener,
      options?: AddEventListenerOptions | boolean
    ) {
      if (type !== 'popstate') {
        window.addEventListener(type, listener, options);
        return;
      }
      const adopting = (event: Event) => {
        const from = current();
        if (from && !hasEntryKey((event as PopStateEvent).state)) adoptBrowserEntry(from);
        listener(event);
      };
      popListeners.set(listener, adopting);
      gate.popListeners.push(adopting);
    },
    removeEventListener(
      type: string,
      listener: EventListener,
      options?: EventListenerOptions | boolean
    ) {
      if (type !== 'popstate') {
        window.removeEventListener(type, listener, options);
        return;
      }
      const adopting = popListeners.get(listener);
      if (!adopting) return;
      popListeners.delete(listener);
      gate.popListeners.splice(gate.popListeners.indexOf(adopting) >>> 0, 1);
    },
  };
};

/** TanStack history's popstate listeners, wrapped to adopt the browser's own entries. */
const popListeners = new Map<EventListener, (event: Event) => void>();

/**
 * A write someone else made to `window.history` (the framework router after it rendered a
 * page, an analytics script dropping utm parameters): a move only when the address changes,
 * keeping the app's state of the entry it came from, so a stack screen stays itself. The
 * framework router moves only when it writes an address other than its last one.
 */
const writeFromOutside = (
  target: RouterHistory,
  method: 'push' | 'replace',
  data: unknown,
  url?: string | URL | null
) => {
  if (url == null) return;
  const next = new URL(url, window.location.href);
  const href = `${next.pathname}${next.search}${next.hash}`;
  if (isFrameworkWrite(data)) {
    const last = frameworkHref;
    frameworkHref = href;
    if (href === last) return;
  }
  if (href === target.location.href) return;
  // TanStack history notifies within push/replace unless a blocker is set (`block`): then the
  // notification comes after an await, and the move would not be marked as an outside one.
  frameworkWrite = true;
  try {
    target[method](href, appState(target.location));
  } finally {
    frameworkWrite = false;
  }
};

/** The storefront history if it was created already; reading it creates nothing. */
export function peekStorefrontHistory(): RouterHistory | null {
  return history;
}

/**
 * The storefront history, created on first use; null on the server and on a page without
 * the gate script (Storybook, tests), where the framework router keeps the history.
 */
export function getStorefrontHistory(): RouterHistory | null {
  if (history) return history;
  if (typeof window === 'undefined') return null;
  const gate = window.__shopanaHistoryGate;
  if (!gate) return null;

  const created = createBrowserHistory({
    window: createHistoryWindow(gate, () => history?.location ?? null),
  });
  frameworkHref = created.location.href;
  gate.onWrite = (method, data, url) => writeFromOutside(created, method, data, url);
  history = created;
  return history;
}

/** What TanStack history tells its subscribers: the location and the move. */
type SubscriberArgs = Parameters<Parameters<RouterHistory['subscribe']>[0]>[0];

export interface StorefrontHistoryUpdate extends SubscriberArgs {
  /** The move mirrors a write of someone else, the framework router included. */
  fromOutside: boolean;
}

/** Hears every move of the storefront history; returns the cleanup. */
export function subscribeStorefrontHistory(
  listener: (update: StorefrontHistoryUpdate) => void
): () => void {
  const target = getStorefrontHistory();
  if (!target) return () => {};
  return target.subscribe((args) =>
    listener({ ...args, fromOutside: frameworkWrite })
  );
}

export type { HistoryLocation, RouterHistory };
