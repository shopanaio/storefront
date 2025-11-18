'use client';

import { create } from 'zustand';
import {
  WishlistItem,
  WishlistSectionId,
  WishlistSnapshot,
} from '@src/modules/wishlist/types';
import {
  emitWishlistEvent,
  WishlistEvent,
} from '@src/modules/wishlist/state/wishlistBus';
import { WISHLIST_STORAGE_VERSION } from '@src/modules/wishlist/data/storage';

export type SectionValidationStatus = 'idle' | 'valid' | 'invalid';

export interface WishlistSectionEntry {
  status: SectionValidationStatus;
  required: boolean;
  busy: boolean;
  errors?: Record<string, string>;
}

export interface WishlistCounts {
  totalItems: number;
  selectedItems: number;
  shareableItems: number;
}

export interface WishlistState {
  sections: Partial<Record<WishlistSectionId, WishlistSectionEntry>>;
  items: WishlistItem[];
  selectedItemIds: string[];
  counts: WishlistCounts;
  activeOperationsCount: number;

  registerSection: (id: WishlistSectionId, required: boolean) => void;
  unregisterSection: (id: WishlistSectionId) => void;
  sectionValid: (id: WishlistSectionId) => void;
  sectionInvalid: (
    id: WishlistSectionId,
    errors?: Record<string, string>
  ) => void;
  resetSection: (id: WishlistSectionId) => void;
  setSectionBusy: (id: WishlistSectionId, busy: boolean) => void;

  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  updateItem: (item: WishlistItem) => void;
  removeItem: (itemId: string) => void;

  toggleItemSelection: (itemId: string) => void;
  clearSelection: () => void;
  selectAll: () => void;

  incrementActiveOperations: () => void;
  decrementActiveOperations: () => void;

  requestSync: () => void;
}

const makeCounts = (
  items: WishlistItem[],
  selectedItemIds: string[]
): WishlistCounts => {
  const selected = selectedItemIds.filter((id) =>
    items.some((item) => item.id === id)
  );
  const shareable = items.filter((item) => (item.tags?.length ?? 0) > 0);
  return {
    totalItems: items.length,
    selectedItems: selected.length,
    shareableItems: shareable.length,
  };
};

export const isSectionValid = (entry?: WishlistSectionEntry): boolean => {
  if (!entry) {
    return false;
  }
  if (!entry.required) {
    return true;
  }
  return entry.status === 'valid';
};

export const computeMissingRequiredSections = (
  state: WishlistState
): WishlistSectionId[] => {
  return Object.entries(state.sections)
    .filter(
      ([, entry]) => entry?.required && entry.status !== 'valid'
    )
    .map(([id]) => id as WishlistSectionId);
};

const emitSnapshotEvent = (items: WishlistItem[], event: WishlistEvent) => {
  const snapshot: WishlistSnapshot = {
    items,
    metadata: {
      version: WISHLIST_STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
    },
    preferences: undefined,
  };
  void emitWishlistEvent(event, { snapshot });
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  sections: {},
  items: [],
  selectedItemIds: [],
  counts: {
    totalItems: 0,
    selectedItems: 0,
    shareableItems: 0,
  },
  activeOperationsCount: 0,

  registerSection: (id, required) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: { status: 'idle', required, busy: false },
      },
    }));
    void emitWishlistEvent(WishlistEvent.SectionRegistered, {
      sectionId: id,
      required,
    });
  },
  unregisterSection: (id) => {
    set((state) => {
      const sections = { ...state.sections };
      delete sections[id];
      return { sections };
    });
    void emitWishlistEvent(WishlistEvent.SectionUnregistered, { sectionId: id });
  },
  sectionValid: (id) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] ?? { required: true, busy: false }),
          status: 'valid',
        },
      },
    }));
    void emitWishlistEvent(WishlistEvent.SectionValid, { sectionId: id });
  },
  sectionInvalid: (id, errors) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] ?? { required: true, busy: false }),
          status: 'invalid',
          errors,
        },
      },
    }));
    void emitWishlistEvent(WishlistEvent.SectionInvalid, {
      sectionId: id,
      errors,
    });
  },
  resetSection: (id) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] ?? { required: true, busy: false }),
          status: 'idle',
          errors: undefined,
        },
      },
    }));
  },
  setSectionBusy: (id, busy) => {
    set((state) => ({
      sections: {
        ...state.sections,
        [id]: {
          ...(state.sections[id] ?? { required: true, status: 'idle' }),
          busy,
        },
      },
    }));
  },

  setItems: (items) => {
    set((state) => {
      const selectedItemIds = state.selectedItemIds.filter((id) =>
        items.some((item) => item.id === id)
      );
      return {
        items,
        selectedItemIds,
        counts: makeCounts(items, selectedItemIds),
      };
    });
    emitSnapshotEvent(items, WishlistEvent.WishlistUpdated);
  },
  addItem: (item) => {
    set((state) => {
      const items = [item, ...state.items];
      return {
        items,
        counts: makeCounts(items, state.selectedItemIds),
      };
    });
    void emitWishlistEvent(WishlistEvent.ItemAdded, { item });
    emitSnapshotEvent(get().items, WishlistEvent.WishlistUpdated);
  },
  updateItem: (item) => {
    set((state) => {
      const items = state.items.map((i) => (i.id === item.id ? item : i));
      return {
        items,
        counts: makeCounts(items, state.selectedItemIds),
      };
    });
    void emitWishlistEvent(WishlistEvent.ItemUpdated, { item });
    emitSnapshotEvent(get().items, WishlistEvent.WishlistUpdated);
  },
  removeItem: (itemId) => {
    set((state) => {
      const items = state.items.filter((item) => item.id !== itemId);
      const selectedItemIds = state.selectedItemIds.filter(
        (id) => id !== itemId
      );
      return {
        items,
        selectedItemIds,
        counts: makeCounts(items, selectedItemIds),
      };
    });
    void emitWishlistEvent(WishlistEvent.ItemRemoved, { itemId });
    emitSnapshotEvent(get().items, WishlistEvent.WishlistUpdated);
  },
  toggleItemSelection: (itemId) => {
    set((state) => {
      const selected = state.selectedItemIds.includes(itemId)
        ? state.selectedItemIds.filter((id) => id !== itemId)
        : [...state.selectedItemIds, itemId];
      return {
        selectedItemIds: selected,
        counts: makeCounts(state.items, selected),
      };
    });
  },
  clearSelection: () => {
    set((state) => ({
      selectedItemIds: [],
      counts: makeCounts(state.items, []),
    }));
  },
  selectAll: () => {
    set((state) => {
      const selected = state.items.map((item) => item.id);
      return {
        selectedItemIds: selected,
        counts: makeCounts(state.items, selected),
      };
    });
  },
  incrementActiveOperations: () => {
    set((state) => ({
      activeOperationsCount: state.activeOperationsCount + 1,
    }));
  },
  decrementActiveOperations: () => {
    set((state) => ({
      activeOperationsCount: Math.max(0, state.activeOperationsCount - 1),
    }));
  },
  requestSync: () => {
    void emitWishlistEvent(WishlistEvent.SyncRequested, {});
  },
}));
