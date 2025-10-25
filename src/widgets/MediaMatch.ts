export type MediaMatchCallback = (matches: boolean, mql: MediaQueryList) => void;

/**
 * MediaMatch — tiny wrapper around window.matchMedia with SSR safety,
 * immediate callback invocation, and unsubscribe support.
 */
export class MediaMatch {
  private readonly query: string;
  private mql: MediaQueryList | null = null;
  private listeners = new Set<MediaMatchCallback>();

  constructor(query: string) {
    this.query = query;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        this.mql = window.matchMedia(this.query);
      } catch {
        this.mql = null;
      }
    }
  }

  static minWidth(px: number): MediaMatch {
    return new MediaMatch(`(min-width: ${px}px)`);
  }

  static maxWidth(px: number): MediaMatch {
    // Use a tiny epsilon for max to avoid rounding edge cases
    return new MediaMatch(`(max-width: ${px - 0.05}px)`);
  }

  get matches(): boolean {
    return !!this.mql?.matches;
  }

  /**
   * Subscribe to match changes. Returns an unsubscribe function.
   * The callback is invoked immediately with the current state.
   */
  subscribe(cb: MediaMatchCallback): () => void {
    this.listeners.add(cb);
    const mql = this.mql;
    // Immediate call with the current state (SSR => false)
    try {
      cb(!!mql?.matches, mql || ({} as MediaQueryList));
    } catch {}

    if (!mql) {
      return () => this.listeners.delete(cb);
    }

    const handler = (e: MediaQueryListEvent) => {
      try {
        this.listeners.forEach((fn) => fn(e.matches, mql));
      } catch {}
    };

    // Modern addEventListener fallback to older addListener
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
    } else if (typeof (mql as any).addListener === 'function') {
      (mql as any).addListener(handler);
    }

    return () => {
      this.listeners.delete(cb);
      if (typeof mql.removeEventListener === 'function') {
        mql.removeEventListener('change', handler);
      } else if (typeof (mql as any).removeListener === 'function') {
        (mql as any).removeListener(handler);
      }
    };
  }

  /**
   * Dispose all listeners.
   */
  dispose(): void {
    const mql = this.mql;
    if (!mql) {
      this.listeners.clear();
      return;
    }
    // Recreate a handler that forwards current state, then remove
    const noop = () => {};
    try {
      if (typeof mql.removeEventListener === 'function') {
        // We don't track per-handler references here; subscribe() returns targeted unsubscribers.
        // dispose() is best-effort: clear the set, leaving no active callbacks retained.
      } else if (typeof (mql as any).removeListener === 'function') {
        // Same note as above.
      }
    } catch {}
    this.listeners.clear();
  }
}

export default MediaMatch;

