import { create } from 'zustand';

/** Whether the sign-in drawer of the guest checkout (G1–G3) is open. */
export const useAuthDialogStore = create<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
