/** Serializes cart writes and reconciles the remaining optimistic edits after each write. */
export function createCartMutationQueue(
  onSettled: (optimisticEdits: ReadonlyArray<() => void>) => void
) {
  let tail = Promise.resolve();
  const pending: Array<{ optimisticEdit?: () => void }> = [];
  return {
    get pending() {
      return pending.length;
    },
    run<T>(
      operation: () => Promise<T>,
      optimisticEdit?: () => void
    ): Promise<T> {
      optimisticEdit?.();
      const entry = { optimisticEdit };
      pending.push(entry);
      const result = tail.then(operation);
      const settled = result.finally(() => {
        pending.splice(pending.indexOf(entry), 1);
        onSettled(
          pending.flatMap((item) =>
            item.optimisticEdit ? [item.optimisticEdit] : []
          )
        );
      });
      tail = settled.then(
        () => undefined,
        () => undefined
      );
      return settled;
    },
  };
}
