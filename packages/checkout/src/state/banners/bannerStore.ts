import { create } from 'zustand';
import type { SectionId } from '#checkout/state/interface';

/** A save of the buyer's input that failed; shown in the checkout banner until it succeeds. */
export interface SaveError {
  /** Operation that failed; its next success clears the error. */
  key: string;
  message: string;
  sectionId: SectionId | null;
}

interface BannerStore {
  /**
   * Failed saves of the checkout (contact, recipient, note, payment method…). One error per
   * operation: a retry that fails again replaces it, so background retries do not pile up.
   */
  saveErrors: SaveError[];
  /** Ids of the banners the buyer closed on this page. */
  dismissed: ReadonlySet<string>;
  reportSaveError: (error: SaveError) => void;
  clearSaveError: (key: string) => void;
  dismiss: (id: string) => void;
  reset: () => void;
}

export const useBannerStore = create<BannerStore>((set) => ({
  saveErrors: [],
  dismissed: new Set(),
  reportSaveError: (error) =>
    set((state) => ({
      saveErrors: [
        ...state.saveErrors.filter((item) => item.key !== error.key),
        error,
      ],
    })),
  clearSaveError: (key) =>
    set((state) =>
      state.saveErrors.some((item) => item.key === key)
        ? { saveErrors: state.saveErrors.filter((item) => item.key !== key) }
        : state
    ),
  dismiss: (id) =>
    set((state) => ({ dismissed: new Set(state.dismissed).add(id) })),
  reset: () => set({ saveErrors: [], dismissed: new Set() }),
}));

export const reportSaveError = (error: SaveError) =>
  useBannerStore.getState().reportSaveError(error);

export const clearSaveError = (key: string) =>
  useBannerStore.getState().clearSaveError(key);
