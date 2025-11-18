import dynamic from 'next/dynamic';
export { WishlistProvider } from '@src/modules/wishlist/providers/WishlistProvider';
export {
  useWishlist,
  useWishlistActions,
  useWishlistCounts,
  useWishlistItems,
  useWishlistSelection,
  useSelectedWishlistItems,
} from '@src/modules/wishlist/hooks/public';

export const Wishlist = dynamic(
  () => import('./components/Wishlist').then((m) => m.Wishlist),
  { ssr: false }
);

export const WishlistViewLazy = dynamic(
  () => import('./components/WishlistView').then((m) => m.WishlistView),
  { ssr: false }
);
