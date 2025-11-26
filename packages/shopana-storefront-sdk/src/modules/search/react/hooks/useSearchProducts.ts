'use client';

import { useSearchDataContext } from '../context/SearchDataContext';
import type { SearchProduct } from '../../core/types';

export function useSearchProducts(): SearchProduct[] {
  const { data } = useSearchDataContext();
  return data.results?.products ?? [];
}
