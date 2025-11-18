'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createEmptyWishlist,
  loadWishlist,
  saveWishlist,
} from '@src/modules/wishlist/data/storage';
import { WishlistSnapshot } from '@src/modules/wishlist/types';
import { useWishlistStorageSync } from '@src/modules/wishlist/hooks/useWishlistStorageSync';
import {
  emitWishlistEvent,
  WishlistEvent,
} from '@src/modules/wishlist/state/wishlistBus';
import { useWishlistStore } from '@src/modules/wishlist/state/wishlistStore';

export interface WishlistDataContextValue {
  wishlist: WishlistSnapshot;
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  updateWishlist: (
    updater:
      | WishlistSnapshot
      | ((prev: WishlistSnapshot) => WishlistSnapshot)
  ) => Promise<WishlistSnapshot>;
  refresh: () => Promise<void>;
}

const WishlistDataContext = createContext<WishlistDataContextValue | null>(
  null
);

const useSyncStore = (snapshot: WishlistSnapshot) => {
  useEffect(() => {
    useWishlistStore.getState().setItems(snapshot.items);
  }, [snapshot]);
};

export const WishlistDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlist, setWishlist] = useState<WishlistSnapshot>(() =>
    createEmptyWishlist()
  );
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useSyncStore(wishlist);

  const hydrate = useCallback(() => {
    try {
      const snapshot = loadWishlist();
      setWishlist(snapshot);
      setError(null);
      setLoaded(true);
      setLoading(false);
      void emitWishlistEvent(WishlistEvent.WishlistLoaded, { snapshot });
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const updateWishlist = useCallback<
    WishlistDataContextValue['updateWishlist']
  >(async (updater) => {
    try {
      const next =
        typeof updater === 'function'
          ? (updater as (prev: WishlistSnapshot) => WishlistSnapshot)(wishlist)
          : updater;
      const persisted = saveWishlist(next);
      setWishlist(persisted);
      setLoaded(true);
      setLoading(false);
      setError(null);
      void emitWishlistEvent(WishlistEvent.WishlistSaved, {
        snapshot: persisted,
      });
      return persisted;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  }, [wishlist]);

  useWishlistStorageSync(
    useCallback(
      (snapshot) => {
        setWishlist(snapshot);
        setLoaded(true);
        setLoading(false);
      },
      [setWishlist]
    )
  );

  const value = useMemo<WishlistDataContextValue>(
    () => ({
      wishlist,
      loading,
      loaded,
      error,
      updateWishlist,
      refresh: async () => {
        hydrate();
      },
    }),
    [wishlist, loading, loaded, error, updateWishlist, hydrate]
  );

  return (
    <WishlistDataContext.Provider value={value}>
      {children}
    </WishlistDataContext.Provider>
  );
};

export const useWishlistData = () => {
  const ctx = useContext(WishlistDataContext);
  if (!ctx) {
    throw new Error(
      'useWishlistData must be used within WishlistDataProvider'
    );
  }
  return ctx;
};
