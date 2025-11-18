'use client';

import React, { createContext, useContext } from 'react';
import { WishlistApi } from '@src/modules/wishlist/api/interface';
import { useCreateWishlistApi } from '@src/modules/wishlist/api/useCreateWishlistApi';

const WishlistApiContext = createContext<WishlistApi | null>(null);

export const WishlistApiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const api = useCreateWishlistApi();
  return (
    <WishlistApiContext.Provider value={api}>
      {children}
    </WishlistApiContext.Provider>
  );
};

export const useWishlistApi = (): WishlistApi => {
  const ctx = useContext(WishlistApiContext);
  if (!ctx) {
    throw new Error('useWishlistApi must be used within WishlistApiProvider');
  }
  return ctx;
};
