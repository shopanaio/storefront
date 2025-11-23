import { create } from 'zustand';
import type { Entity } from '@shopana/entity';
import { CurrencyCode } from '@codegen/schema-client';

// modalStore
interface ModalState {
  isAuthModalVisible: boolean;
  setIsAuthModalVisible: (visible: boolean) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  // App main drawer (navigation)
  isAppDrawerOpen: boolean;
  setIsAppDrawerOpen: (open: boolean) => void;
}
export const useModalStore = create<ModalState>((set) => ({
  isAuthModalVisible: false,
  setIsAuthModalVisible: (visible) => set({ isAuthModalVisible: visible }),
  isCartDrawerOpen: false,
  setIsCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
  isAppDrawerOpen: false,
  setIsAppDrawerOpen: (open) => set({ isAppDrawerOpen: open }),
}));

// currencyStore
interface CurrencyState {
  currencyCode: CurrencyCode;
  setCurrencyCode: (code: CurrencyCode) => void;
}
export const useCurrencyStore = create<CurrencyState>((set) => ({
  currencyCode: CurrencyCode.Usd,
  setCurrencyCode: (code) => set({ currencyCode: code }),
}));

// cartStore
interface CartState {
  cart: Entity.Cart | null;
  setCart: (cart: Entity.Cart | null) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}
export const useCartStore = create<CartState>((set) => ({
  cart: null,
  setCart: (cart) => set({ cart }),
  error: null,
  setError: (error) => set({ error }),
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
