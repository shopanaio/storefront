'use client';

import { sections } from '@src/modules/wishlist/sections/sections';
import { WishlistSectionId } from '@src/modules/wishlist/types';

interface Props {
  slug: WishlistSectionId;
}

export const WishlistSectionRenderer = ({ slug }: Props) => {
  const section = sections[slug];
  if (!section) {
    return null;
  }
  const { Component } = section;
  return <Component />;
};
