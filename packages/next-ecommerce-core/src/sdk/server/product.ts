import { createMockProduct } from './mockData';
import type { ProductPageData } from '../types';

export async function getProductPageData(handle: string): Promise<ProductPageData> {
  const product = createMockProduct(handle);
  const relatedProducts = ['alpha', 'beta', 'gamma'].map((slug, index) =>
    createMockProduct(`${handle}-${slug}-${index}`)
  );

  return {
    product,
    relatedProducts,
  };
}
