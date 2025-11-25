'use client';

import { useHomeData } from './useHomeData';
import type { HomeCategory } from '../../core/types';

export function useHomeCategories() {
  const { categories } = useHomeData();
  return categories;
}

export function useHomeCategory(
  key: 'electronics' | 'toys' | 'sport',
): HomeCategory | null {
  const categories = useHomeCategories();
  return categories[key];
}

export function useHomeAndGarden() {
  const categories = useHomeCategories();
  return categories.homeAndGarden;
}
