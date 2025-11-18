'use client';

import { useMemo } from 'react';
import { useWishlistData } from '@src/modules/wishlist/context/WishlistDataContext';
import { useWishlistApi } from '@src/modules/wishlist/context/WishlistApiContext';
import { useWishlistStore } from '@src/modules/wishlist/state/wishlistStore';
import { WishlistItem } from '@src/modules/wishlist/types';

/**
 * Returns the full wishlist snapshot alongside loading state.
 */
export const useWishlist = () => {
  const data = useWishlistData();
  return data;
};

/**
 * Returns wishlist API actions for adding/removing items externally.
 */
export const useWishlistActions = () => {
  return useWishlistApi();
};

/**
 * Selector hook for wishlist counts (total/selected/shareable).
 */
export const useWishlistCounts = () => {
  return useWishlistStore((state) => state.counts);
};

/**
 * Selector hook for wishlist items array.
 */
export const useWishlistItems = () => {
  return useWishlistStore((state) => state.items);
};

/**
 * Manages wishlist selection helpers for UI outside the module.
 */
export const useWishlistSelection = () => {
  const selectedItemIds = useWishlistStore((state) => state.selectedItemIds);
  const toggleItemSelection = useWishlistStore(
    (state) => state.toggleItemSelection
  );
  const clearSelection = useWishlistStore((state) => state.clearSelection);
  const selectAll = useWishlistStore((state) => state.selectAll);

  return useMemo(
    () => ({
      selectedItemIds,
      toggleItemSelection,
      clearSelection,
      selectAll,
    }),
    [selectedItemIds, toggleItemSelection, clearSelection, selectAll]
  );
};

/**
 * Derived helper that exposes the currently selected wishlist items.
 */
export const useSelectedWishlistItems = (): WishlistItem[] => {
  const items = useWishlistItems();
  const selectedIds = useWishlistStore((state) => state.selectedItemIds);

  return useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds]
  );
};
