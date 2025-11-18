'use client';

import { useEffect } from 'react';
import {
  onWishlistEvent,
  WishlistEvent,
} from '@src/modules/wishlist/state/wishlistBus';
import { useWishlistStore } from '@src/modules/wishlist/state/wishlistStore';

/**
 * Tracks active wishlist operations by listening to operation events.
 */
export const useOperationTracker = () => {
  const { incrementActiveOperations, decrementActiveOperations } =
    useWishlistStore.getState();

  useEffect(() => {
    const offStart = onWishlistEvent(WishlistEvent.OperationStart, () => {
      incrementActiveOperations();
    });
    const offEnd = onWishlistEvent(WishlistEvent.OperationEnd, () => {
      decrementActiveOperations();
    });

    return () => {
      offStart();
      offEnd();
      useWishlistStore.setState({ activeOperationsCount: 0 });
    };
  }, [incrementActiveOperations, decrementActiveOperations]);
};
