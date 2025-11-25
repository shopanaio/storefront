'use client';

import { createContext, useContext } from 'react';
import type { HomeTemplateData } from '../../core/types';

interface HomeDataContextValue {
  data: HomeTemplateData;
}

const HomeDataContext = createContext<HomeDataContextValue | null>(null);

export function useHomeDataContext(): HomeDataContextValue {
  const context = useContext(HomeDataContext);

  if (!context) {
    throw new Error('useHomeDataContext must be used within HomeDataProvider');
  }

  return context;
}

export { HomeDataContext };
