'use client';

import { WishlistSnapshot } from '@src/modules/wishlist/types';

export const WISHLIST_STORAGE_KEY = 'wishlist:v1';
export const WISHLIST_STORAGE_VERSION = 1;

type NullableSnapshot = Partial<WishlistSnapshot> | null | undefined;

/**
 * Returns an empty wishlist snapshot with metadata populated.
 */
export const createEmptyWishlist = (): WishlistSnapshot => ({
  items: [],
  metadata: {
    version: WISHLIST_STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
  },
});

const migrations: Record<
  number,
  (snapshot: WishlistSnapshot) => WishlistSnapshot
> = {};

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/**
 * Applies migrations to the incoming snapshot to bring it to the latest version.
 */
export const migrateWishlist = (
  snapshot: NullableSnapshot
): WishlistSnapshot => {
  if (!snapshot || !Array.isArray(snapshot.items)) {
    return createEmptyWishlist();
  }

  const next: WishlistSnapshot = {
    items: snapshot.items ?? [],
    metadata: {
      version: snapshot.metadata?.version ?? 0,
      updatedAt: snapshot.metadata?.updatedAt,
    },
    preferences: snapshot.preferences,
  };

  let cursor = next;
  while (cursor.metadata.version < WISHLIST_STORAGE_VERSION) {
    const transform = migrations[cursor.metadata.version];
    if (transform) {
      cursor = transform(cursor);
    } else {
      cursor.metadata.version = WISHLIST_STORAGE_VERSION;
    }
  }

  if (cursor.metadata.version !== WISHLIST_STORAGE_VERSION) {
    cursor.metadata.version = WISHLIST_STORAGE_VERSION;
  }

  return {
    ...cursor,
    metadata: {
      ...cursor.metadata,
      updatedAt: cursor.metadata.updatedAt ?? new Date().toISOString(),
    },
  };
};

/**
 * Loads wishlist snapshot from localStorage with graceful fallbacks.
 */
export const loadWishlist = (): WishlistSnapshot => {
  const storage = getStorage();
  if (!storage) {
    return createEmptyWishlist();
  }

  try {
    const raw = storage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) {
      return createEmptyWishlist();
    }
    const parsed = JSON.parse(raw) as NullableSnapshot;
    return migrateWishlist(parsed);
  } catch (error) {
    console.warn('Failed to parse wishlist snapshot, resetting.', error);
    storage.removeItem(WISHLIST_STORAGE_KEY);
    return createEmptyWishlist();
  }
};

/**
 * Saves wishlist snapshot to localStorage.
 */
export const saveWishlist = (snapshot: WishlistSnapshot): WishlistSnapshot => {
  const storage = getStorage();
  if (!storage) {
    return snapshot;
  }

  try {
    const payload: WishlistSnapshot = {
      ...snapshot,
      metadata: {
        ...snapshot.metadata,
        version: WISHLIST_STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
      },
    };
    storage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(payload));
    return payload;
  } catch (error) {
    console.error('Failed to persist wishlist snapshot', error);
    throw error;
  }
};

/**
 * Clears the wishlist storage entry.
 */
export const clearWishlist = (): void => {
  const storage = getStorage();
  storage?.removeItem(WISHLIST_STORAGE_KEY);
};
