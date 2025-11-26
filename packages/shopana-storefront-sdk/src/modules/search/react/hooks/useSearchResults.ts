'use client';

import { useSearchDataContext } from '../context/SearchDataContext';
import type { SearchResults } from '../../core/types';

export function useSearchResults(): SearchResults | null {
  const { data } = useSearchDataContext();
  return data.results;
}
