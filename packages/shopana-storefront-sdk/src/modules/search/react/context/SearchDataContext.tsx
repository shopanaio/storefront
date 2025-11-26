'use client';

import { createContext, useContext } from 'react';
import type { SearchTemplateData } from '../../core/types';

interface SearchDataContextValue {
  data: SearchTemplateData;
}

const SearchDataContext = createContext<SearchDataContextValue | null>(null);

export function useSearchDataContext(): SearchDataContextValue {
  const context = useContext(SearchDataContext);

  if (!context) {
    throw new Error('useSearchDataContext must be used within SearchDataProvider');
  }

  return context;
}

export { SearchDataContext };
