'use client';

import { Wishlist } from '@src/modules/wishlist';
import { WishlistBrand } from '@src/modules/wishlist/page/brand';

export const WishlistPageClient = () => {
  return <Wishlist brand={<WishlistBrand />} />;
};
