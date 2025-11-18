'use client';

import { ComponentType } from 'react';
import { WishlistSectionId } from '@src/modules/wishlist/types';
import { SavedItemsSection } from '@src/modules/wishlist/sections/saved-items/components/Container';

export interface SectionConfig {
  slug: WishlistSectionId;
  titleKey: string;
  Component: ComponentType<Record<string, never>>;
}

export const sections: Record<WishlistSectionId, SectionConfig> = {
  [WishlistSectionId.SavedItems]: {
    slug: WishlistSectionId.SavedItems,
    titleKey: 'sections.saved-items',
    Component: SavedItemsSection,
  },
};
