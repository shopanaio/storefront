/**
 * Input a section holds back before saving it (the order note waits for a pause in typing).
 * Placing the order sends it at once first, so the order goes with what the buyer typed.
 */
const flushers = new Set<() => void>();

/** Registers the function that sends the held-back input now. Returns the unregister. */
export function registerPendingInput(flush: () => void): () => void {
  flushers.add(flush);
  return () => {
    flushers.delete(flush);
  };
}

/** Sends every held-back input now; each save joins the mutation queue in this call. */
export function flushPendingInputs() {
  flushers.forEach((flush) => flush());
}
