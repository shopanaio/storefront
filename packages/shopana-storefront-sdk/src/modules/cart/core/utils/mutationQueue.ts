export interface MutationQueueOptions {
  /**
   * Resource the mutation writes. A queued mutation with the same key that has not started
   * yet is replaced: only the latest value is sent, and the replaced call is rejected with
   * `MutationSupersededError`.
   */
  key?: string;
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
  waiter: Waiter;
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
    queue.flatMap((entry) =>
      entry.optimisticEdit ? [entry.optimisticEdit] : []
    );

  const drain = async () => {
    if (running) return;
    const entry = queue.shift();
    if (!entry) return;
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
        void drain();
      }
    }
  };

  const run = <T>(
    operation: () => Promise<T>,
    { key, optimisticEdit }: MutationQueueOptions = {}
  ): Promise<T> => {
    optimisticEdit?.();
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
      queued.waiter = waiter;
      replaced.reject(new MutationSupersededError(promise));
    } else {
      queue.push({ key, operation, optimisticEdit, waiter });
    }
    void drain();
    return promise;
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
