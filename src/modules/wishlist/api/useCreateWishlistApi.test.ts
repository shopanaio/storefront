import { describe, it, expect, beforeEach } from 'vitest';
import { buildWishlistApi } from '@src/modules/wishlist/api/useCreateWishlistApi';
import { createEmptyWishlist } from '@src/modules/wishlist/data/storage';
import { WishlistItem, WishlistSnapshot } from '@src/modules/wishlist/types';

const runner = {
  run: async <T>(fn: () => Promise<T>) => fn(),
};

const createApplyItems = () => {
  let snapshot: WishlistSnapshot = createEmptyWishlist();
  return {
    apply: async (mutator: (items: WishlistItem[]) => WishlistItem[]) => {
      snapshot = {
        ...snapshot,
        items: mutator(snapshot.items),
      };
      return snapshot;
    },
    getSnapshot: () => snapshot,
  };
};

describe('wishlist api', () => {
  let applyItems: ReturnType<typeof createApplyItems>;
  beforeEach(() => {
    applyItems = createApplyItems();
  });

  it('adds and removes items', async () => {
    const api = buildWishlistApi({
      applyItems: applyItems.apply,
      operations: {
        add: runner,
        remove: runner,
        update: runner,
        move: runner,
        clear: runner,
      },
      emit: async () => undefined,
    });

    await api.addItem({
      id: 'one',
      title: 'Item one',
      sku: 'SKU-1',
      quantity: 1,
      addedAt: new Date().toISOString(),
    });

    expect(applyItems.getSnapshot().items).toHaveLength(1);

    await api.removeItem('one');
    expect(applyItems.getSnapshot().items).toHaveLength(0);
  });

  it('updates items immutably', async () => {
    const api = buildWishlistApi({
      applyItems: applyItems.apply,
      operations: {
        add: runner,
        remove: runner,
        update: runner,
        move: runner,
        clear: runner,
      },
      emit: async () => undefined,
    });

    await api.addItem({
      id: 'one',
      title: 'Item',
      sku: 'SKU-1',
      quantity: 1,
      addedAt: new Date().toISOString(),
    });

    await api.updateItem({
      id: 'one',
      title: 'Updated',
      sku: 'SKU-1',
      quantity: 2,
      addedAt: new Date().toISOString(),
    });

    expect(applyItems.getSnapshot().items[0]?.quantity).toBe(2);
  });
});
