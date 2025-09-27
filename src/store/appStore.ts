import { create } from 'zustand';
import { ApiCheckout, ApiProduct, CurrencyCode } from '@codegen/schema-client';
import { createJSONStorage, persist } from 'zustand/middleware';


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
  cart: ApiCheckout | null;
  setCart: (cart: ApiCheckout | null) => void;
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
  reviewProduct: ApiProduct | null;
  setReviewProduct: (product: ApiProduct) => void;
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
interface BoxBuilderState {
  boxCartId: string | null;
  setBoxCartId: (id: string) => void;
  selectedBoxId: string | null;
  setSelectedBoxId: (id: string) => void;
  selectedCardIds: string[];
  addSelectedCardId: (id: string) => void;
  removeSelectedCardId: (id: string) => void;
  clearSelectedCardIds: () => void;
}

export const useBoxBuilderStore = create<BoxBuilderState>()(
  persist(
    (set) => ({
      boxCartId: null,
      setBoxCartId: (id) => set({ boxCartId: id }),
      selectedBoxId: null,
      setSelectedBoxId: (id) => set({ selectedBoxId: id }),
      selectedCardIds: [],
      addSelectedCardId: (id) =>
        set((state) =>
          state.selectedCardIds.includes(id)
            ? state
            : { selectedCardIds: [...state.selectedCardIds, id] }
        ),
      removeSelectedCardId: (id) =>
        set((state) => ({
          selectedCardIds: state.selectedCardIds.filter((x) => x !== id),
        })),
      clearSelectedCardIds: () => set({ selectedCardIds: [] }),
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
  setSelectedFilters: (filters: FiltersMap | ((prevState: FiltersMap) => FiltersMap)) => void;
  updateFilter: (handle: string, filterData: { values: string[] | [number, number]; inputs?: string[] }) => void;
  removeFilter: (handle: string) => void;
  clearFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set, get) => ({
  selectedFilters: {},
  setSelectedFilters: (filters) =>
    set((state) => ({
      selectedFilters: typeof filters === 'function' ? filters(state.selectedFilters) : filters
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
