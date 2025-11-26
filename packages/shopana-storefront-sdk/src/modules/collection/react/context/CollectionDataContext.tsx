'use client';

import { createContext, useContext } from 'react';
import type { CollectionTemplateData } from '../../core/types';

interface CollectionDataContextValue {
  data: CollectionTemplateData;
}

const CollectionDataContext = createContext<CollectionDataContextValue | null>(null);

export function useCollectionDataContext(): CollectionDataContextValue {
  const context = useContext(CollectionDataContext);

  if (!context) {
    throw new Error('useCollectionDataContext must be used within CollectionDataProvider');
  }

  return context;
}

export { CollectionDataContext };
