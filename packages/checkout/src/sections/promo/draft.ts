import { create } from 'zustand';

interface PromoDraftStore {
  /** Text in the promo code field, not applied yet. */
  code: string;
  setCode: (code: string) => void;
}

/**
 * The promo code field text. It lives outside the summary, which is not rendered while the
 * checkout is renewed, so a code being typed survives the renewal (BR-tvyl).
 */
export const usePromoDraft = create<PromoDraftStore>((set) => ({
  code: '',
  setCode: (code) => set({ code }),
}));
