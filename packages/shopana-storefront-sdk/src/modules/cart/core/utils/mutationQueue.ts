export interface MutationQueueOptions {
  /**
   * Resource the mutation writes. A queued mutation with the same key that has not started
   * yet is replaced: only the latest value is sent, and every caller gets its result.
   */
  key?: string;
  /** Applied at once and replayed over the confirmed state until the mutation settles. */
  optimisticEdit?: () => void;
}

interface Entry {
  key?: string;
  operation: () => Promise<unknown>;
  optimisticEdit?: () => void;
  waiters: Array<{ resolve: (value: unknown) => void; reject: (error: unknown) => void }>;
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

  const optimisticEdits = () =>
    queue.flatMap((entry) => (entry.optimisticEdit ? [entry.optimisticEdit] : []));

  const drain = async () => {
    if (running) return;
    const entry = queue.shift();
    if (!entry) return;
    running = entry;
    try {
      const value = await entry.operation();
      entry.waiters.forEach((waiter) => waiter.resolve(value));
    } catch (error) {
      entry.waiters.forEach((waiter) => waiter.reject(error));
    } finally {
      running = null;
      onSettled(optimisticEdits());
      void drain();
    }
  };

  const run = <T>(
    operation: () => Promise<T>,
    { key, optimisticEdit }: MutationQueueOptions = {}
  ): Promise<T> => {
    optimisticEdit?.();
    return new Promise<T>((resolve, reject) => {
      const waiter = { resolve: resolve as (value: unknown) => void, reject };
      const queued = key === undefined ? undefined : queue.find((entry) => entry.key === key);
      if (queued) {
        queued.operation = operation;
        queued.optimisticEdit = optimisticEdit;
        queued.waiters.push(waiter);
      } else {
        queue.push({ key, operation, optimisticEdit, waiters: [waiter] });
      }
      void drain();
    });
  };

  return {
    get pending() {
      return queue.length + (running ? 1 : 0);
    },
    run,
    /** Resolves once every mutation queued before this call has settled. */
    idle(): Promise<void> {
      return run(async () => undefined);
    },
  };
}
