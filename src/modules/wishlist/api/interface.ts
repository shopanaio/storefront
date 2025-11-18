import { WishlistItem, WishlistSnapshot } from '@src/modules/wishlist/types';

export interface WishlistApi {
  addItem: (input: WishlistItem) => Promise<WishlistSnapshot>;
  removeItem: (itemId: string) => Promise<WishlistSnapshot>;
  updateItem: (input: WishlistItem) => Promise<WishlistSnapshot>;
  moveToCart: (itemId: string) => Promise<WishlistSnapshot>;
  clear: () => Promise<WishlistSnapshot>;
}
