/**
 * Input a section holds back before saving it (the order note waits for a pause in typing or
 * for the retry of a failed save). Placing the order sends it at once first, so the order goes
 * with what the buyer typed.
 */
const flushers = new Set<() => Promise<unknown> | void>();

/**
 * Registers the function that sends the held-back input now and returns its save, if any.
 * Returns the unregister.
 */
export function registerPendingInput(
  flush: () => Promise<unknown> | void
): () => void {
  flushers.add(flush);
  return () => {
    flushers.delete(flush);
  };
}

/**
 * Sends every held-back input now; each save joins the mutation queue in this call. Returns
 * the saves started.
 */
export function flushPendingInputs(): Promise<unknown>[] {
  return [...flushers].flatMap((flush) => {
    const save = flush();
    return save ? [save] : [];
  });
}
