'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core/types';
import HomeProductGridSection from '../HomeProductGridSection';

interface ProductGridSectionSettings {
  categoryHandle: string;
  paginationCount?: number;
}

export default function ProductGridSection({
  settings,
}: SectionProps<ProductGridSectionSettings>) {
  return (
    <HomeProductGridSection
      settings={{
        categoryHandle: settings.categoryHandle,
        paginationCount: settings.paginationCount,
      }}
    />
  );
}
