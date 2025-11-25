'use client';

import type { HomeProduct } from '../../core/types';
import { useHomeCategory } from './useHomeCategories';

export function useCategoryProducts(
  categoryKey: 'electronics' | 'toys' | 'sport',
): HomeProduct[] {
  const category = useHomeCategory(categoryKey);
  return category?.products ?? [];
}
