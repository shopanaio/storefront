'use client';

import { useContext } from 'react';
import { PageDataContext, type PageDataContextValue } from './PageDataContext';

export function usePageData<TData = unknown>() {
  const value = useContext(PageDataContext);
  if (!value) {
    throw new Error('usePageData must be used within PageDataProvider');
  }
  return value as PageDataContextValue<TData>;
}
