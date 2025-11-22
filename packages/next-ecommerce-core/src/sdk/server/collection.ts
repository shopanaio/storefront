import { createMockCollection, createMockProduct } from './mockData';
import type { CollectionPageData } from '../types';

export async function getCollectionPageData(handle: string): Promise<CollectionPageData> {
  const collection = createMockCollection(handle);
  const products = Array.from({ length: 6 }, (_, index) =>
    createMockProduct(`${handle}-${index + 1}`)
  );

  return {
    collection,
    products,
  };
}
