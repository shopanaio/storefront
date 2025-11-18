'use client';

import { WishlistDataProvider } from '@src/modules/wishlist/context/WishlistDataContext';
import { WishlistApiProvider } from '@src/modules/wishlist/context/WishlistApiContext';

interface Props {
  children: React.ReactNode;
}

/**
 * Composable provider that exposes wishlist data + API contexts.
 * Use this to make wishlist hooks available across the storefront.
 */
export const WishlistProvider = ({ children }: Props) => {
  return (
    <WishlistDataProvider>
      <WishlistApiProvider>{children}</WishlistApiProvider>
    </WishlistDataProvider>
  );
};
