'use client';

import { createContext, useContext } from 'react';
import type { ProductTemplateData } from '../../core/types';

interface ProductDataContextValue {
  data: ProductTemplateData;
}

const ProductDataContext = createContext<ProductDataContextValue | null>(null);

export function useProductDataContext(): ProductDataContextValue {
  const context = useContext(ProductDataContext);

  if (!context) {
    throw new Error('useProductDataContext must be used within ProductDataProvider');
  }

  return context;
}

export { ProductDataContext };
