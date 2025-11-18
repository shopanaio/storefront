import { describe, it, expect, beforeEach } from 'vitest';
import {
  useWishlistStore,
  computeMissingRequiredSections,
} from '@src/modules/wishlist/state/wishlistStore';
import { WishlistSectionId } from '@src/modules/wishlist/types';

const resetStore = () => {
  useWishlistStore.setState(() => ({
    sections: {},
    items: [],
    selectedItemIds: [],
    counts: {
      totalItems: 0,
      selectedItems: 0,
      shareableItems: 0,
    },
    activeOperationsCount: 0,
  }));
};

describe('wishlist store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('tracks sections and missing required ones', () => {
    const store = useWishlistStore.getState();
    store.registerSection(WishlistSectionId.SavedItems, true);
    store.registerSection(WishlistSectionId.Notes, false);
    const missing = computeMissingRequiredSections(useWishlistStore.getState());
    expect(missing).toContain(WishlistSectionId.SavedItems);
  });

  it('adds items and updates counts', () => {
    const store = useWishlistStore.getState();
    store.addItem({
      id: 'item-1',
      title: 'Item 1',
      sku: 'SKU-1',
      quantity: 1,
      addedAt: new Date().toISOString(),
    });
    expect(useWishlistStore.getState().counts.totalItems).toBe(1);
  });

  it('toggles selection', () => {
    const store = useWishlistStore.getState();
    store.addItem({
      id: 'item-1',
      title: 'Item 1',
      sku: 'SKU-1',
      quantity: 1,
      addedAt: new Date().toISOString(),
    });
    store.toggleItemSelection('item-1');
    expect(useWishlistStore.getState().selectedItemIds).toContain('item-1');
  });
});
