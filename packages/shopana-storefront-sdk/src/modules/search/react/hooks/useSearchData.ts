'use client';

import { useSearchDataContext } from '../context/SearchDataContext';
import type { SearchTemplateData } from '../../core/types';

export function useSearchData(): SearchTemplateData {
  const { data } = useSearchDataContext();
  return data;
}
