'use client';

import type { SectionProps } from '@shopana/storefront-sdk/core/types';
import { useHomeCategory } from '@shopana/storefront-sdk/modules/home/react/hooks/useHomeCategories';
import { useCategoryProducts } from '@shopana/storefront-sdk/modules/home/react/hooks/useCategoryProducts';
import { ProductSlideShow } from '@/components/ProductSlideshow';

type CategoryKey = 'electronics' | 'sport' | 'toys';

interface CategoryProductsSectionSettings {
  categoryKey: CategoryKey;
}

export default function CategoryProductsSection({
  settings,
}: SectionProps<CategoryProductsSectionSettings>) {
  const category = useHomeCategory(settings.categoryKey);
  const products = useCategoryProducts(settings.categoryKey);

  if (!category || products.length === 0) {
    return null;
  }

  return (
    <ProductSlideShow
      title={category.title}
      products={products}
    />
  );
}
