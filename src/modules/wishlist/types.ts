'use client';

/**
 * Shared Wishlist module types.
 */
export interface WishlistItem {
  id: string;
  title: string;
  sku: string;
  quantity: number;
  image?: string;
  currency?: string;
  unitPrice?: number;
  note?: string;
  tags?: string[];
  addedAt: string;
  updatedAt?: string;
}

export interface WishlistMetadata {
  version: number;
  updatedAt?: string;
}

export interface WishlistPreferences {
  note?: string;
  tags?: string[];
  shareEmail?: string;
}

export interface WishlistSnapshot {
  items: WishlistItem[];
  metadata: WishlistMetadata;
  preferences?: WishlistPreferences;
}

export enum WishlistSectionId {
  SavedItems = 'savedItems',
}

export type WishlistOperation =
  | 'addItem'
  | 'removeItem'
  | 'updateItem'
  | 'moveToCart'
  | 'clear';

export interface WishlistFeatures {
  // Reserved for future features
}
