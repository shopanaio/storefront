import type { Template } from '@shopana/storefront-sdk/core/types';
import ProductGridSection from '@/sections/ProductGridSection';
import HomeSlideshowSection from '@/sections/HomeSlideshowSection';

const homeTemplate: Template = {
  sections: {
    order: [
      'electronicsGrid',
      'electronics',
      'sport',
      'toys',
    ],
    electronicsGrid: {
      component: ProductGridSection,
      settings: { categoryHandle: 'electronics' },
    },
    electronics: {
      component: HomeSlideshowSection,
      settings: { categoryKey: 'electronics', pagination: true },
    },
    sport: {
      component: HomeSlideshowSection,
      settings: { categoryKey: 'sport', pagination: true },
    },
    toys: {
      component: HomeSlideshowSection,
      settings: { categoryKey: 'toys', pagination: true },
    },
  },
};

export default homeTemplate;
