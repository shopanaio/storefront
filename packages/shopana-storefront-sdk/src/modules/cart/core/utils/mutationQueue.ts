export interface MutationQueueOptions {
  /**
   * Resource the mutation writes. A queued mutation with the same key that has not started
   * yet is replaced: only the latest value is sent, and the replaced call is rejected with
   * `MutationSupersededError`.
   */
  key?: string;
  /**
   * Milliseconds the mutation waits before it is sent; a newer write of the same `key` restarts
   * the wait. Mutations queued after it wait too: writes keep their order.
   */
  delay?: number;
  /**
   * Lines whose cost the mutation may change, by `cartLineWriteKey`; `'all'` for every line.
   * The other lines keep their confirmed cost on screen while it is pending.
   */
  lines?: readonly string[] | 'all';
  /** Applied at once and replayed over the confirmed state until the mutation settles. */
  optimisticEdit?: () => void;
}

/**
 * Rejection of a call whose value was never sent: a newer write of the same resource took
 * its place in the queue. `replacement` settles as that newer write does.
 */
export class MutationSupersededError extends Error {
  constructor(readonly replacement: Promise<unknown>) {
    super('A newer write of the same resource replaced this one.');
    this.name = 'MutationSupersededError';
  }
}

export function isMutationSuperseded(
  error: unknown
): error is MutationSupersededError {
  return error instanceof MutationSupersededError;
}

/**
 * Settles as the write that finally carried the resource: a superseded call follows its
 * replacement, for callers that only need the resource saved with its latest value.
 */
export function followSuperseded<T>(write: Promise<T>): Promise<T> {
  return write.catch((error: unknown) =>
    isMutationSuperseded(error)
      ? followSuperseded(error.replacement as Promise<T>)
      : Promise.reject(error)
  );
}

interface Waiter {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

interface Entry {
  key?: string;
  operation: () => Promise<unknown>;
  optimisticEdit?: () => void;
  lines?: readonly string[] | 'all';
  waiter: Waiter;
  /** When the mutation may be sent, in `Date.now()` time. */
  sendAt: number;
}

/**
 * Serializes the writes of the cart and its checkout: one at a time, in the order asked for.
 * The remaining optimistic edits are reconciled after each write.
 */
export function createCartMutationQueue(
  onSettled: (optimisticEdits: ReadonlyArray<() => void>) => void
) {
  const queue: Entry[] = [];
  let running: Entry | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  const optimisticEdits = () =>
    queue.flatMap((entry) =>
      entry.optimisticEdit ? [entry.optimisticEdit] : []
    );

  const drain = async () => {
    if (running) return;
    const entry = queue[0];
    if (!entry) return;
    const wait = entry.sendAt - Date.now();
    if (wait > 0) {
      if (timer === null) {
        timer = setTimeout(() => {
          timer = null;
          void drain();
        }, wait);
      }
      return;
    }
    queue.shift();
    running = entry;
    try {
      entry.waiter.resolve(await entry.operation());
    } catch (error) {
      entry.waiter.reject(error);
    } finally {
      running = null;
      try {
        onSettled(optimisticEdits());
      } catch (error) {
        // A failed reconciliation must not stop the writes queued after this one.
        console.error('Failed to reconcile the cart after a write:', error);
      } finally {
        notify();
        void drain();
      }
    }
  };

  /** Sends the head of the queue when it is due: a changed wait replaces the timer. */
  const schedule = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    void drain();
  };

  const run = <T>(
    operation: () => Promise<T>,
    { key, delay = 0, lines, optimisticEdit }: MutationQueueOptions = {}
  ): Promise<T> => {
    optimisticEdit?.();
    const sendAt = Date.now() + delay;
    let waiter!: Waiter;
    const promise = new Promise<T>((resolve, reject) => {
      waiter = { resolve: resolve as (value: unknown) => void, reject };
    });
    const queued =
      key === undefined ? undefined : queue.find((entry) => entry.key === key);
    if (queued) {
      // The newer value keeps the place of the waiting one; the replaced call learns that its
      // value never went.
      const replaced = queued.waiter;
      queued.operation = operation;
      queued.optimisticEdit = optimisticEdit;
      queued.lines = lines;
      queued.waiter = waiter;
      queued.sendAt = sendAt;
      replaced.reject(new MutationSupersededError(promise));
    } else {
      queue.push({ key, operation, optimisticEdit, lines, waiter, sendAt });
    }
    notify();
    schedule();
    return promise;
  };

  /** Sends the waiting mutations without the rest of their delay. */
  const flush = () => {
    for (const entry of queue) entry.sendAt = 0;
    schedule();
  };

  return {
    get pending() {
      return queue.length + (running ? 1 : 0);
    },
    /**
     * Whether a mutation is waiting or in flight: any one, or with `line` one that may change the
     * cost of that line.
     */
    isPending(line?: string): boolean {
      const entries = running ? [running, ...queue] : queue;
      if (line === undefined) return entries.length > 0;
      return entries.some(
        (entry) => entry.lines === 'all' || entry.lines?.includes(line)
      );
    },
    run,
    flush,
    /**
     * Resolves once every mutation queued before this call has settled; the delayed ones are
     * sent at once.
     */
    idle(): Promise<void> {
      if (!running && queue.length === 0) return Promise.resolve();
      flush();
      return run(async () => undefined);
    },
    /** Calls `listener` whenever mutations are queued or one settles. Returns the unsubscribe. */
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
