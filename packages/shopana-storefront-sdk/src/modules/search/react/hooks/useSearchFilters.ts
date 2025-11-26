'use client';

import { useSearchDataContext } from '../context/SearchDataContext';
import type { SearchFilter } from '../../core/types';

export function useSearchFilters(): SearchFilter[] {
  const { data } = useSearchDataContext();
  return data.results?.filters ?? [];
}
