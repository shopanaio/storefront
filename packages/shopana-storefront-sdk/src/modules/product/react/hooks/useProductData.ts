'use client';

import { useProductDataContext } from '../context/ProductDataContext';
import type { ProductTemplateData } from '../../core/types';

export function useProductData(): ProductTemplateData {
  const { data } = useProductDataContext();
  return data;
}
