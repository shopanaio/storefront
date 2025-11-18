'use client';

import { useEffect } from 'react';
import {
  loadWishlist,
  WISHLIST_STORAGE_KEY,
} from '@src/modules/wishlist/data/storage';
import { WishlistSnapshot } from '@src/modules/wishlist/types';
import {
  emitWishlistEvent,
  WishlistEvent,
} from '@src/modules/wishlist/state/wishlistBus';

/**
 * Subscribes to storage events to keep wishlist state synchronized across tabs.
 */
export const useWishlistStorageSync = (
  onExternalChange: (snapshot: WishlistSnapshot) => void
) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handler = (event: StorageEvent) => {
      if (event.key && event.key !== WISHLIST_STORAGE_KEY) {
        return;
      }
      const snapshot = loadWishlist();
      onExternalChange(snapshot);
      void emitWishlistEvent(WishlistEvent.WishlistLoaded, { snapshot });
    };
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [onExternalChange]);
};
