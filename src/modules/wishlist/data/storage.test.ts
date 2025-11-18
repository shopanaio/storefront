import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createEmptyWishlist,
  loadWishlist,
  saveWishlist,
  migrateWishlist,
  WISHLIST_STORAGE_KEY,
} from '@src/modules/wishlist/data/storage';
import { WishlistSnapshot } from '@src/modules/wishlist/types';

const createMemoryStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    length: 0,
  } as unknown as Storage;
};

describe('wishlist storage helpers', () => {
  let originalWindow: Window & typeof globalThis | undefined;

  beforeEach(() => {
    originalWindow = globalThis.window;
    (globalThis as typeof globalThis & { window: Window }).window = {
      localStorage: createMemoryStorage(),
    } as Window;
  });

  afterEach(() => {
    if (originalWindow) {
      globalThis.window = originalWindow;
    } else {
      // @ts-expect-error allow cleanup
      delete globalThis.window;
    }
  });

  it('returns empty snapshot when nothing stored', () => {
    const snapshot = loadWishlist();
    expect(snapshot.items).toHaveLength(0);
  });

  it('persists and loads wishlist snapshot', () => {
    const snapshot: WishlistSnapshot = {
      ...createEmptyWishlist(),
      items: [
        {
          id: '1',
          title: 'Test Item',
          sku: 'SKU-1',
          quantity: 1,
          addedAt: new Date().toISOString(),
        },
      ],
    };

    saveWishlist(snapshot);

    const stored = JSON.parse(
      window.localStorage.getItem(WISHLIST_STORAGE_KEY) ?? '{}'
    );
    expect(stored.items).toHaveLength(1);

    const loaded = loadWishlist();
    expect(loaded.items[0]?.id).toBe('1');
  });

  it('migrates invalid snapshot to defaults', () => {
    const migrated = migrateWishlist(null);
    expect(migrated.items).toEqual([]);
  });
});
