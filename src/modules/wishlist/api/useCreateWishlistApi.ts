import { useCallback, useMemo } from 'react';
import { WishlistApi } from '@src/modules/wishlist/api/interface';
import { useWishlistData } from '@src/modules/wishlist/context/WishlistDataContext';
import {
  WishlistItem,
  WishlistSectionId,
  WishlistSnapshot,
} from '@src/modules/wishlist/types';
import {
  emitWishlistEvent,
  WishlistEvent,
  WishlistOperationKey,
} from '@src/modules/wishlist/state/wishlistBus';
import { useWishlistOperation } from '@src/modules/wishlist/hooks/useWishlistOperation';

type OperationRunner = {
  run: <T>(fn: () => Promise<T>) => Promise<T>;
};

export interface WishlistApiFactoryDeps {
  applyItems: (
    mutator: (current: WishlistItem[]) => WishlistItem[]
  ) => Promise<WishlistSnapshot>;
  operations: {
    add: OperationRunner;
    remove: OperationRunner;
    update: OperationRunner;
    move: OperationRunner;
    clear: OperationRunner;
  };
  emit?: typeof emitWishlistEvent;
}

export const buildWishlistApi = ({
  applyItems,
  operations,
  emit = emitWishlistEvent,
}: WishlistApiFactoryDeps): WishlistApi => ({
  addItem: async (input) =>
    operations.add.run(async () => {
      const next = await applyItems((items) => [
        withTimestamps(input),
        ...items.filter((item) => item.id !== input.id),
      ]);
      return next;
    }),
  removeItem: async (itemId) =>
    operations.remove.run(async () => {
      const next = await applyItems((items) =>
        items.filter((item) => item.id !== itemId)
      );
      return next;
    }),
  updateItem: async (input) =>
    operations.update.run(async () => {
      const item = withTimestamps(input);
      const next = await applyItems((items) =>
        items.some((existing) => existing.id === input.id)
          ? items.map((existing) =>
              existing.id === input.id ? { ...existing, ...item } : existing
            )
          : [item, ...items]
      );
      return next;
    }),
  moveToCart: async (itemId) =>
    operations.move.run(async () => {
      let moved: WishlistItem | null = null;
      const next = await applyItems((items) =>
        items.filter((item) => {
          if (item.id === itemId) {
            moved = item;
            return false;
          }
          return true;
        })
      );
      if (moved) {
        void emit(WishlistEvent.ItemMovedToCart, { item: moved });
      }
      return next;
    }),
  clear: async () =>
    operations.clear.run(async () => {
      const next = await applyItems(() => []);
      void emit(WishlistEvent.WishlistCleared, {});
      return next;
    }),
});

const withTimestamps = (item: WishlistItem): WishlistItem => ({
  ...item,
  addedAt: item.addedAt ?? new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useCreateWishlistApi = (): WishlistApi => {
  const { updateWishlist } = useWishlistData();

  const applyItems = useCallback(
    async (mutator: (current: WishlistItem[]) => WishlistItem[]) => {
      return updateWishlist((prev) => ({
        ...prev,
        items: mutator(prev.items),
      }));
    },
    [updateWishlist]
  );

  const addOp = useWishlistOperation({
    operationKey: WishlistOperationKey.AddItem,
    sectionId: WishlistSectionId.SavedItems,
    errorMessage: 'Failed to add item to wishlist',
  });
  const removeOp = useWishlistOperation({
    operationKey: WishlistOperationKey.RemoveItem,
    sectionId: WishlistSectionId.SavedItems,
    errorMessage: 'Failed to remove item',
  });
  const updateOp = useWishlistOperation({
    operationKey: WishlistOperationKey.UpdateItem,
    sectionId: WishlistSectionId.SavedItems,
    errorMessage: 'Failed to update item',
  });
  const moveOp = useWishlistOperation({
    operationKey: WishlistOperationKey.MoveToCart,
    sectionId: WishlistSectionId.SavedItems,
    errorMessage: 'Failed to move item to cart',
  });
  const clearOp = useWishlistOperation({
    operationKey: WishlistOperationKey.Clear,
    sectionId: WishlistSectionId.SavedItems,
    errorMessage: 'Failed to clear wishlist',
  });

  return useMemo<WishlistApi>(
    () =>
      buildWishlistApi({
        applyItems,
        operations: {
          add: addOp,
          remove: removeOp,
          update: updateOp,
          move: moveOp,
          clear: clearOp,
        },
      }),
    [addOp, removeOp, updateOp, moveOp, clearOp, applyItems]
  );
};
