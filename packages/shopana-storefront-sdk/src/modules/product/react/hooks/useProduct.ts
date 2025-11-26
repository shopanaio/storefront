'use client';

import { useProductDataContext } from '../context/ProductDataContext';
import type { Product } from '../../core/types';

export function useProduct(): Product | null {
  const { data } = useProductDataContext();
  return data.product;
}
