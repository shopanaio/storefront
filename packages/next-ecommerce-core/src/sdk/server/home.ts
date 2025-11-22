import { createMockCollection, createMockProduct } from './mockData';
import type { HomePageData } from '../types';

export async function getHomePageData(): Promise<HomePageData> {
  return {
    featuredProducts: ['alpha', 'beta', 'gamma'].map((handle) => createMockProduct(handle)),
    featuredCollections: ['summer', 'winter', 'sale'].map((handle) => createMockCollection(handle)),
  };
}
