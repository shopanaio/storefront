import { create } from 'zustand';
import type { model } from "@shopana/storefront-sdk";
import { CurrencyCode } from '@codegen/schema-client';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ProductType } from '@src/modules/storefront-box-builder-module/config/types';

// modalStore
interface ModalState {
  isAuthModalVisible: boolean;
  setIsAuthModalVisible: (visible: boolean) => void;
  isRateModalVisible: boolean;
  setIsRateModalVisible: (visible: boolean) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  // App main drawer (navigation)
  isAppDrawerOpen: boolean;
  setIsAppDrawerOpen: (open: boolean) => void;
  // Search dialog (mobile search)
  searchDialogOpen: boolean;
  setSearchDialogOpen: (open: boolean) => void;
  // Global search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}
export const useModalStore = create<ModalState>((set) => ({
  isAuthModalVisible: false,
  setIsAuthModalVisible: (visible) => set({ isAuthModalVisible: visible }),
  isRateModalVisible: false,
  setIsRateModalVisible: (visible) => set({ isRateModalVisible: visible }),
  isCartDrawerOpen: false,
  setIsCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
  isAppDrawerOpen: false,
  setIsAppDrawerOpen: (open) => set({ isAppDrawerOpen: open }),
  searchDialogOpen: false,
  setSearchDialogOpen: (open) => set({ searchDialogOpen: open }),
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
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
  cart: model.Cart | null;
  setCart: (cart: model.Cart | null) => void;
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

// reviewStore
interface ReviewState {
  shouldOpenReviewAfterAuth: boolean;
  setShouldOpenReviewAfterAuth: (v: boolean) => void;
  reviewProductId: string | null;
  setReviewProductId: (id: string) => void;
  clearReviewProductId: () => void;
  reviewProduct: model.Product | null;
  setReviewProduct: (product: model.Product) => void;
  clearReviewProduct: () => void;
}
export const useReviewStore = create<ReviewState>((set) => ({
  shouldOpenReviewAfterAuth: false,
  setShouldOpenReviewAfterAuth: (v) => set({ shouldOpenReviewAfterAuth: v }),
  reviewProductId: null,
  setReviewProductId: (id) => set({ reviewProductId: id }),
  clearReviewProductId: () => set({ reviewProductId: null }),
  reviewProduct: null,
  setReviewProduct: (product) => set({ reviewProduct: product }),
  clearReviewProduct: () => set({ reviewProduct: null }),
}));

// boxBuilderStore
export interface BoxBuilderState {
  cartId: string | null;
  setCartId: (id: string | null) => void;
  boxProductIds: string[];
  setBoxProductIds: (id: string[]) => void;
  addBoxProductId: (id: string) => void;
  addDesignProductId: (id: string, productType: ProductType) => void;
  removeBoxProductId: (id: string) => void;
  cardProductIds: string[];
  markProductIds: string[];
  setMarkProductIds: (ids: string[]) => void;
  addCardProductId: (id: string) => void;
  setCardProductIds: (ids: string[]) => void;
  removeCardProductId: (id: string) => void;
  clearCardProductIds: () => void;
  clearAll: () => void;
}

export const useBoxBuilderStore = create<BoxBuilderState>()(
  persist(
    (set) => ({
      /** Cart */
      cartId: null,
      setCartId: (id) => set({ cartId: id }),
      /** Box products */
      boxProductIds: [],
      markProductIds: [],
      setBoxProductIds: (ids) => {
        set({ boxProductIds: ids });
      },
      addBoxProductId: (id) => {
        set((state) => ({ boxProductIds: [...state.boxProductIds, id] }));
      },
      removeBoxProductId: (id) => {
        set((state) => ({
          boxProductIds: state.boxProductIds.filter((x) => x !== id),
        }));
      },
      /** Card products */
      cardProductIds: [],
      addCardProductId: (id) => {
        set((state) => ({ cardProductIds: [...state.cardProductIds, id] }));
      },
      addDesignProductId: (id, productType) => {
        if (productType === ProductType.Box) {
          set(() => ({ boxProductIds: [id] }));
        } else if (productType === ProductType.Card) {
          set(() => ({ cardProductIds: [id] }));
        } else if (productType === ProductType.Mark) {
          set(() => ({ markProductIds: [id] }));
        }
      },
      setCardProductIds: (ids) => {
        set({ cardProductIds: ids });
      },
      setMarkProductIds: (ids) => {
        set({ markProductIds: ids });
      },
      removeCardProductId: (id) => {
        set((state) => ({
          cardProductIds: state.cardProductIds.filter((x) => x !== id),
        }));
      },
      clearCardProductIds: () => {
        set({ cardProductIds: [] });
      },
      clearAll: () => {
        set({
          cartId: null,
          boxProductIds: [],
          cardProductIds: [],
        });
      },
    }),
    {
      name: 'box-builder-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// filtersStore
export type FiltersMap = Record<
  string,
  { values: string[] | [number, number]; inputs?: string[] }
>;

interface FiltersState {
  selectedFilters: FiltersMap;
  setSelectedFilters: (
    filters: FiltersMap | ((prevState: FiltersMap) => FiltersMap)
  ) => void;
  updateFilter: (
    handle: string,
    filterData: { values: string[] | [number, number]; inputs?: string[] }
  ) => void;
  removeFilter: (handle: string) => void;
  clearFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  selectedFilters: {},
  setSelectedFilters: (filters) =>
    set((state) => ({
      selectedFilters:
        typeof filters === 'function'
          ? filters(state.selectedFilters)
          : filters,
    })),
  updateFilter: (handle, filterData) =>
    set((state) => ({
      selectedFilters: {
        ...state.selectedFilters,
        [handle]: filterData,
      },
    })),
  removeFilter: (handle) =>
    set((state) => {
      const { [handle]: removed, ...rest } = state.selectedFilters;
      return { selectedFilters: rest };
    }),
  clearFilters: () => set({ selectedFilters: {} }),
}));
