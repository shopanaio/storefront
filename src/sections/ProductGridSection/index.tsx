'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core/types';
import { HomeProductGrid } from '@/components/Home/HomeProductGrid';

interface ProductGridSectionSettings {
  categoryHandle: string;
  paginationCount?: number;
}

export default function ProductGridSection({
  settings,
}: SectionProps<ProductGridSectionSettings>) {
  return (
    <HomeProductGrid
      categoryHandle={settings.categoryHandle}
      paginationCount={settings.paginationCount}
    />
  );
}
