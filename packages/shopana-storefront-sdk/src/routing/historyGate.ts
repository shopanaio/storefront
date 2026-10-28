/**
 * The gate that isolates the framework router (Next's app router) from the browser history,
 * as an inline script that runs before the router touches it: rendered with `next/script`
 * `beforeInteractive` in the root layout, Next runs it from `self.__next_s` before hydration,
 * and the router patches the history and adds its popstate listener only in a hydration
 * effect.
 *
 * - `pushState`/`replaceState` on `window.history` become accessors that ignore assignments,
 *   so the router's patch never takes. A call writes nothing: it goes to `onWrite`, where the
 *   storefront history (SDK, TanStack history) decides what becomes an entry.
 * - The first `popstate` listener on `window`, in the capture phase (Chromium runs listeners
 *   on `window` in the order they were added, capture or not, as checked in Chrome 152;
 *   engines that run capture ones on the target first run it first too). It stops every
 *   event and hands it to `popListeners` only: the router never hears back/forward, and
 *   neither does any other `popstate` listener (analytics, widgets closing on back). They
 *   hear moves through the storefront history (`subscribeStorefrontHistory`).
 *
 * Plain ES5, no references outside itself: it is sent as source.
 */
export const historyGateScript = `(function () {
  if (window.__shopanaHistoryGate) return;
  var gate = { onWrite: null, popListeners: [] };
  ['pushState', 'replaceState'].forEach(function (name) {
    var method = name === 'pushState' ? 'push' : 'replace';
    function write(data, unused, url) {
      if (gate.onWrite) gate.onWrite(method, data, url);
    }
    Object.defineProperty(window.history, name, {
      configurable: true,
      enumerable: true,
      get: function () {
        return write;
      },
      set: function () {}
    });
  });
  window.addEventListener('popstate', function (event) {
    event.stopImmediatePropagation();
    var listeners = gate.popListeners.slice();
    for (var i = 0; i < listeners.length; i++) listeners[i](event);
  }, true);
  window.__shopanaHistoryGate = gate;
})();`;

export type HistoryGateWrite = (
  method: 'push' | 'replace',
  data: unknown,
  url?: string | URL | null
) => void;

export interface HistoryGate {
  /** Gets every `window.history.pushState`/`replaceState` call; null drops them. */
  onWrite: HistoryGateWrite | null;
  /** The only listeners that hear `popstate`. */
  popListeners: Array<(event: PopStateEvent) => void>;
}

declare global {
  interface Window {
    __shopanaHistoryGate?: HistoryGate;
  }
}
