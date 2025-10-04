/**
 * InflightManager: debounced scheduling and in-flight guards.
 * - Debounces operations per logical key.
 * - Ensures only the last run clears the in-flight state (race protection).
 * - Exposes lifecycle hooks for start/end to integrate with UI busy state.
 */
import { debounce } from 'lodash';

export class InflightManager<K extends string> {
  private inflight = new Map<K, number>();
  private pendingFns = new Map<K, () => void>();
  private debouncedExecutors = new Map<string, ReturnType<typeof debounce>>();

  /**
   * Schedule a function under a debounced executor keyed by K and delay.
   */
  schedule(key: K, fn: () => void, delayMs = 150): void {
    this.pendingFns.set(key, fn);
    const executorKey = `${key}:${delayMs}`;
    let executor = this.debouncedExecutors.get(executorKey);
    if (!executor) {
      executor = debounce(() => {
        const pendingFn = this.pendingFns.get(key);
        if (pendingFn) {
          pendingFn();
          this.pendingFns.delete(key);
        }
      }, delayMs, { leading: false, trailing: true });
      this.debouncedExecutors.set(executorKey, executor);
    }
    executor();
  }

  /**
   * Run an async operation with in-flight guard and lifecycle callbacks.
   */
  async runWithInflight<T>(
    key: K,
    operation: () => Promise<T>,
    opts?: { onStart?: () => void; onEnd?: () => void }
  ): Promise<T> {
    const ts = Date.now();
    this.inflight.set(key, ts);
    try {
      opts?.onStart?.();
      const result = await operation();
      return result;
    } finally {
      if (this.inflight.get(key) === ts) {
        this.inflight.delete(key);
        opts?.onEnd?.();
      }
    }
  }

  /**
   * Cancel all pending debounced executors and clear internal maps.
   */
  cancelAll(): void {
    this.debouncedExecutors.forEach(executor => executor.cancel());
    this.debouncedExecutors.clear();
    this.pendingFns.clear();
    this.inflight.clear();
  }
}
