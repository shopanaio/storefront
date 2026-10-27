/**
 * The browser history as is, past any framework router that hooks into it.
 *
 * A framework router (Next's app router) replaces `window.history.pushState` and
 * `replaceState` with its own versions and listens to `popstate` to restore its state; on
 * an entry it did not write it even reloads the page. Navigation the app does itself (a
 * mobile screen stack) must run none of that: these functions call the native methods from
 * the History prototype, which the router leaves untouched, and hear back/forward first.
 */

/** Native history writes: real addresses, no framework router work. */
export const browserHistory = {
  push(state: unknown, url?: string): void {
    History.prototype.pushState.call(window.history, state, '', url);
  },
  replace(state: unknown, url?: string): void {
    History.prototype.replaceState.call(window.history, state, '', url);
  },
  /** Moves by `delta` entries; the browser then fires popstate. */
  go(delta: number): void {
    window.history.go(delta);
  },
  get state(): unknown {
    return window.history.state;
  },
};

type PopStateHandler = (event: PopStateEvent) => boolean;

const handlers = new Set<PopStateHandler>();
let installed = false;

/**
 * One popstate listener for the app's handlers, added when this module loads. Listeners on
 * `window` run in the order they were added, and the SDK app imports this module (App.tsx)
 * before hydration, so it comes ahead of the router's listener, added in a hydration effect.
 * A handled event stops there and never reaches the router.
 */
function install(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener(
    'popstate',
    (event) => {
      for (const handler of handlers) {
        if (handler(event)) {
          event.stopImmediatePropagation();
          return;
        }
      }
    },
    { capture: true }
  );
}

install();

/**
 * Hears back/forward before a framework router. When `handler` returns true the event is
 * the app's and stops, so the router never sees it. Returns the cleanup.
 */
export function listenPopState(handler: PopStateHandler): () => void {
  install();
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}
