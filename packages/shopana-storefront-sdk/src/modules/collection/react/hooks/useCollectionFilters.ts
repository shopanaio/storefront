'use client';

import { useCollectionDataContext } from '../context/CollectionDataContext';
import type { CollectionFilter } from '../../core/types';

export function useCollectionFilters(): CollectionFilter[] {
  const { data } = useCollectionDataContext();
  return data.collection?.listing?.filters ?? [];
}
