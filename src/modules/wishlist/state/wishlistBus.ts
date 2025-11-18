'use client';

import Emittery from 'emittery';
import {
  WishlistItem,
  WishlistSnapshot,
  WishlistSectionId,
} from '@src/modules/wishlist/types';

export enum WishlistOperationKey {
  AddItem = 'addItem',
  RemoveItem = 'removeItem',
  UpdateItem = 'updateItem',
  MoveToCart = 'moveToCart',
  Clear = 'clear',
  UpdateMetadata = 'updateMetadata',
}

export enum WishlistEvent {
  WishlistLoaded = 'wishlist/loaded',
  WishlistSaved = 'wishlist/saved',
  WishlistUpdated = 'wishlist/updated',
  SyncRequested = 'wishlist/sync-requested',
  ItemAdded = 'wishlist/item-added',
  ItemRemoved = 'wishlist/item-removed',
  ItemUpdated = 'wishlist/item-updated',
  ItemMovedToCart = 'wishlist/item-moved-to-cart',
  WishlistCleared = 'wishlist/cleared',
  SectionRegistered = 'wishlist/section-registered',
  SectionUnregistered = 'wishlist/section-unregistered',
  SectionValid = 'wishlist/section-valid',
  SectionInvalid = 'wishlist/section-invalid',
  OperationStart = 'wishlist/operation-start',
  OperationEnd = 'wishlist/operation-end',
  OperationError = 'wishlist/operation-error',
}

export type WishlistEvents = {
  [WishlistEvent.WishlistLoaded]: {
    snapshot: WishlistSnapshot;
  };
  [WishlistEvent.WishlistSaved]: {
    snapshot: WishlistSnapshot;
  };
  [WishlistEvent.WishlistUpdated]: {
    snapshot: WishlistSnapshot;
  };
  [WishlistEvent.SyncRequested]: object;
  [WishlistEvent.ItemAdded]: {
    item: WishlistItem;
  };
  [WishlistEvent.ItemRemoved]: {
    itemId: string;
  };
  [WishlistEvent.ItemUpdated]: {
    item: WishlistItem;
  };
  [WishlistEvent.ItemMovedToCart]: {
    item: WishlistItem;
  };
  [WishlistEvent.WishlistCleared]: object;

  [WishlistEvent.SectionRegistered]: {
    sectionId: WishlistSectionId;
    required: boolean;
  };
  [WishlistEvent.SectionUnregistered]: {
    sectionId: WishlistSectionId;
  };
  [WishlistEvent.SectionValid]: {
    sectionId: WishlistSectionId;
  };
  [WishlistEvent.SectionInvalid]: {
    sectionId: WishlistSectionId;
    errors?: Record<string, string>;
  };

  [WishlistEvent.OperationStart]: {
    key: WishlistOperationKey;
    sectionId?: WishlistSectionId;
  };
  [WishlistEvent.OperationEnd]: {
    key: WishlistOperationKey;
    sectionId?: WishlistSectionId;
  };
  [WishlistEvent.OperationError]: {
    key: WishlistOperationKey;
    sectionId?: WishlistSectionId;
    message?: string;
    code?: string;
    error?: unknown;
  };
};

export const wishlistBus = new Emittery<WishlistEvents>();

export function emitWishlistEvent<K extends keyof WishlistEvents>(
  eventName: K,
  payload: WishlistEvents[K]
) {
  return wishlistBus.emit(eventName, payload);
}

export function onWishlistEvent<K extends keyof WishlistEvents>(
  eventName: K,
  listener: (payload: WishlistEvents[K]) => void | Promise<void>
) {
  return wishlistBus.on(eventName, listener);
}
