import dynamic from 'next/dynamic';
import type { PageTemplate } from '../core/types';
import type { ProductPageData } from '../sdk/types';

const ProductHero = dynamic(() => import('../sections/ProductHero'));
const ProductRelated = dynamic(() => import('../sections/ProductRelated'));

export const productTemplate: PageTemplate<ProductPageData> = {
  name: 'product',
  sections: [
    {
      id: 'product-hero',
      component: ProductHero,
      settings: {
        headline: 'Featured product',
      },
    },
    {
      id: 'product-related',
      component: ProductRelated,
      settings: {
        title: 'You might also like',
      },
    },
  ],
};
