"use client";

import { create } from "zustand";
import type { ModalFuncProps } from "antd";

export interface MobileConfirmOptions extends ModalFuncProps {}

interface MobileConfirmState {
  open: boolean;
  options: MobileConfirmOptions | null;
  resolve?: (ok: boolean) => void;
  openConfirm: (
    options: MobileConfirmOptions,
    resolver: (ok: boolean) => void
  ) => void;
  closeConfirm: () => void;
  clear: () => void;
}

export const useMobileConfirmStore = create<MobileConfirmState>((set) => ({
  open: false,
  options: null,
  resolve: undefined,
  openConfirm: (options, resolver) =>
    set({ open: true, options, resolve: resolver }),
  closeConfirm: () => set({ open: false }),
  clear: () => set({ options: null, resolve: undefined, open: false }),
}));

export const mobileConfirmApi = {
  open(options: MobileConfirmOptions, resolver: (ok: boolean) => void) {
    useMobileConfirmStore.getState().openConfirm(options, resolver);
  },
  close() {
    useMobileConfirmStore.getState().closeConfirm();
  },
  clear() {
    useMobileConfirmStore.getState().clear();
  },
};
