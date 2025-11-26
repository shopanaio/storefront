'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core/types';
import HomeProductGridSection from '@/sections/HomeProductGridSection';

interface ProductGridSectionSettings {
  categoryHandle: string;
  paginationCount?: number;
}

export default function ProductGridSection({
  settings,
}: SectionProps<ProductGridSectionSettings>) {
  return (
    <HomeProductGridSection
      categoryHandle={settings.categoryHandle}
      paginationCount={settings.paginationCount}
    />
  );
}
