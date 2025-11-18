'use client';

import { useEffect } from 'react';
import {
  onWishlistEvent,
  WishlistEvent,
} from '@src/modules/wishlist/state/wishlistBus';
import { useOperationTracker } from '@src/modules/wishlist/state/hooks/useOperationTracker';

interface Props {
  onSync?: () => void;
}

/**
 * Mount-once controller that wires wishlist lifecycle side effects.
 */
export const WishlistController = ({ onSync }: Props) => {
  useOperationTracker();

  useEffect(() => {
    const offUpdated = onWishlistEvent(
      WishlistEvent.WishlistUpdated,
      ({ snapshot }) => {
        console.debug('[wishlist] updated', snapshot.metadata.updatedAt);
        onSync?.();
      }
    );
    const offSync = onWishlistEvent(WishlistEvent.SyncRequested, () => {
      onSync?.();
    });
    return () => {
      offUpdated();
      offSync();
    };
  }, [onSync]);

  return null;
};
