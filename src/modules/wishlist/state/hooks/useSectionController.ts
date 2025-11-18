'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  onWishlistEvent,
  WishlistEvent,
} from '@src/modules/wishlist/state/wishlistBus';
import {
  useWishlistStore,
  WishlistSectionEntry,
} from '@src/modules/wishlist/state/wishlistStore';
import { WishlistSectionId } from '@src/modules/wishlist/types';

interface Options {
  required: boolean;
}

/**
 * Registers the wishlist section and exposes helpers to update validation state.
 */
export function useSectionController(
  sectionId: WishlistSectionId,
  options: Options
) {
  useEffect(() => {
    const state = useWishlistStore.getState();
    state.registerSection(sectionId, options.required);

    const offStart = onWishlistEvent(
      WishlistEvent.OperationStart,
      ({ sectionId: sid }) => {
        if (sid === sectionId) {
          useWishlistStore.getState().setSectionBusy(sectionId, true);
        }
      }
    );

    const offEnd = onWishlistEvent(
      WishlistEvent.OperationEnd,
      ({ sectionId: sid }) => {
        if (sid === sectionId) {
          useWishlistStore.getState().setSectionBusy(sectionId, false);
        }
      }
    );

    return () => {
      useWishlistStore.getState().unregisterSection(sectionId);
      offStart();
      offEnd();
    };
  }, [sectionId, options.required]);

  const entry: WishlistSectionEntry | undefined = useWishlistStore(
    (state) => state.sections[sectionId]
  );

  const publishValid = useCallback(() => {
    useWishlistStore.getState().sectionValid(sectionId);
  }, [sectionId]);

  const publishInvalid = useCallback(
    (errors?: Record<string, string>) => {
      useWishlistStore.getState().sectionInvalid(sectionId, errors);
    },
    [sectionId]
  );

  const reset = useCallback(() => {
    useWishlistStore.getState().resetSection(sectionId);
  }, [sectionId]);

  return useMemo(
    () => ({
      entry,
      publishValid,
      publishInvalid,
      reset,
    }),
    [entry, publishValid, publishInvalid, reset]
  );
}
