'use client';

import { useCollectionDataContext } from '../context/CollectionDataContext';
import type { CollectionProduct } from '../../core/types';

export function useCollectionProducts(): CollectionProduct[] {
  const { data } = useCollectionDataContext();
  return data.collection?.listing?.products ?? [];
}
