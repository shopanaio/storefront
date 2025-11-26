'use client';

import { useCollectionDataContext } from '../context/CollectionDataContext';
import type { CollectionTemplateData } from '../../core/types';

export function useCollectionData(): CollectionTemplateData {
  const { data } = useCollectionDataContext();
  return data;
}
