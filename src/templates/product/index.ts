import type { Template } from '@shopana/storefront-sdk/core/types';
import ProductPageSection from './sections/ProductPageSection';

const productTemplate: Template = {
  sections: {
    order: ['productPage'],
    productPage: {
      component: ProductPageSection,
      settings: {},
    },
  },
};

export default productTemplate;
