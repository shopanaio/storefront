import { create } from 'zustand';
import type { Checkout } from '#checkout/types/entity';

/**
 * The terms checkbox of the checkout (CHECKBOX acceptance mode). The tick lives in the browser
 * only and belongs to the disclosures the buyer saw: another checkout or another version of the
 * disclosures starts unticked. The server checks the acceptance again when the order is placed.
 */
interface TermsStoreState {
  /** Disclosures the tick and the error belong to (`disclosuresKey`). */
  key: string | null;
  accepted: boolean;
  /** The buyer tried to place the order without ticking the box. */
  error: boolean;
  setAccepted: (key: string, accepted: boolean) => void;
  /** Shows the error under the checkbox. */
  require: (key: string) => void;
  reset: () => void;
}

export const useTermsStore = create<TermsStoreState>((set, get) => ({
  key: null,
  accepted: false,
  error: false,
  setAccepted: (key, accepted) =>
    set({
      key,
      accepted,
      // A tick answers the error; unticking does not raise it before the next press.
      error: accepted ? false : get().key === key && get().error,
    }),
  require: (key) =>
    set((state) => ({
      key,
      accepted: state.key === key && state.accepted,
      error: true,
    })),
  reset: () => set({ key: null, accepted: false, error: false }),
}));

/** Identity of the disclosures shown in a checkout; `null` when it has none. */
export function disclosuresKey(
  checkout: Checkout.Checkout | null
): string | null {
  return checkout?.disclosures
    ? `${checkout.id}:${checkout.disclosures.version}`
    : null;
}

/** Whether the buyer must tick the terms checkbox before placing the order. */
export function requiresTermsCheckbox(
  checkout: Checkout.Checkout | null
): boolean {
  return checkout?.disclosures?.acceptanceMode === 'CHECKBOX';
}

/** Whether the box is ticked for the disclosures of `checkout`. */
export function isTermsAccepted(checkout: Checkout.Checkout | null): boolean {
  const key = disclosuresKey(checkout);
  const state = useTermsStore.getState();
  return key !== null && state.key === key && state.accepted;
}

/** Tick and error of the checkbox for the disclosures of `checkout`. */
export function useTermsState(checkout: Checkout.Checkout | null): {
  key: string | null;
  accepted: boolean;
  error: boolean;
} {
  const key = disclosuresKey(checkout);
  const accepted = useTermsStore(
    (state) => key !== null && state.key === key && state.accepted
  );
  const error = useTermsStore(
    (state) => key !== null && state.key === key && state.error
  );
  return { key, accepted, error };
}
