'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Represents a selected item within a product group.
 */
export interface GroupSelectionItem {
  /** Selected purchasable identifier (e.g. variant id). */
  purchasableId: string;
  /** Quantity of this selected item. */
  quantity: number;
}

/**
 * Persistent selection state for a single product.
 */
export interface ProductGroupSelectionState {
  /** Current variant id selected for the product. */
  variantId: string | null;
  /** Map of groupId -> selected items. */
  selectionsByGroupId: Record<string, GroupSelectionItem[]>;
}

/**
 * Root store that keeps selections keyed by product id.
 */
interface GroupsStoreState {
  /** productId -> state */
  products: Record<string, ProductGroupSelectionState>;
  /** Toggle a purchasable in a group (add/remove, respect single vs multiple outside). */
  toggleItem: (
    productId: string,
    groupId: string,
    purchasableId: string,
    isMultiple: boolean
  ) => void;
  /** Set quantity for a selected purchasable. */
  setItemQty: (
    productId: string,
    groupId: string,
    purchasableId: string,
    quantity: number
  ) => void;
  /** Replace entire selection of a group (useful for single choice). */
  setGroupSelection: (
    productId: string,
    groupId: string,
    items: GroupSelectionItem[]
  ) => void;
  /** Clear selections for product (e.g. when leaving page). */
  clearProduct: (productId: string) => void;
}

const ensureProductState = (
  products: Record<string, ProductGroupSelectionState>,
  productId: string
): ProductGroupSelectionState => {
  const existing = products[productId];
  if (existing) return existing;
  return { variantId: null, selectionsByGroupId: {} };
};

export const useProductGroupsStore = create<GroupsStoreState>()(
  persist(
    (set, get) => ({
      products: {},
      toggleItem: (productId, groupId, purchasableId, isMultiple) => {
        set((state) => {
          const current = ensureProductState(state.products, productId);
          const currentItems = current.selectionsByGroupId[groupId] ?? [];
          const exists = currentItems.some(
            (x) => x.purchasableId === purchasableId
          );

          let nextItems: GroupSelectionItem[];
          if (isMultiple) {
            nextItems = exists
              ? currentItems.filter((x) => x.purchasableId !== purchasableId)
              : [...currentItems, { purchasableId, quantity: 1 }];
          } else {
            nextItems = exists ? [] : [{ purchasableId, quantity: 1 }];
          }

          return {
            products: {
              ...state.products,
              [productId]: {
                ...current,
                selectionsByGroupId: {
                  ...current.selectionsByGroupId,
                  [groupId]: nextItems,
                },
              },
            },
          };
        });
      },
      setItemQty: (productId, groupId, purchasableId, quantity) => {
        set((state) => {
          const current = ensureProductState(state.products, productId);
          const currentItems = current.selectionsByGroupId[groupId] ?? [];
          const nextItems = currentItems.map((x) =>
            x.purchasableId === purchasableId ? { ...x, quantity } : x
          );
          return {
            products: {
              ...state.products,
              [productId]: {
                ...current,
                selectionsByGroupId: {
                  ...current.selectionsByGroupId,
                  [groupId]: nextItems,
                },
              },
            },
          };
        });
      },
      setGroupSelection: (productId, groupId, items) => {
        set((state) => {
          const current = ensureProductState(state.products, productId);
          return {
            products: {
              ...state.products,
              [productId]: {
                ...current,
                selectionsByGroupId: {
                  ...current.selectionsByGroupId,
                  [groupId]: items,
                },
              },
            },
          };
        });
      },
      clearProduct: (productId) => {
        set((state) => {
          const next = { ...state.products };
          delete next[productId];
          return { products: next };
        });
      },
    }),
    {
      name: 'product-groups-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

/**
 * Default empty state for products not yet in the store.
 * Using a constant to avoid creating new object references.
 */
const EMPTY_PRODUCT_STATE: ProductGroupSelectionState = {
  variantId: null,
  selectionsByGroupId: {},
};

/**
 * Hook to access selection state for a single product.
 */
export function useProductGroupsState(productId: string) {
  const state = useProductGroupsStore(
    (s) => s.products[productId] ?? EMPTY_PRODUCT_STATE
  );

  const { toggleItem, setItemQty, setGroupSelection, clearProduct } =
    useProductGroupsStore.getState();

  return {
    state,
    toggleItem: (groupId: string, purchasableId: string, isMultiple: boolean) =>
      toggleItem(productId, groupId, purchasableId, isMultiple),
    setItemQty: (groupId: string, purchasableId: string, quantity: number) =>
      setItemQty(productId, groupId, purchasableId, quantity),
    setGroupSelection: (groupId: string, items: GroupSelectionItem[]) =>
      setGroupSelection(productId, groupId, items),
    clear: () => clearProduct(productId),
  };
}
