'use client';

import { useCollectionDataContext } from '../context/CollectionDataContext';
import type { Collection } from '../../core/types';

export function useCollection(): Collection | null {
  const { data } = useCollectionDataContext();
  return data.collection;
}
