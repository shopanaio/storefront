import type { Template } from '@shopana/storefront-sdk/core/types';
import MainLayout from '@/layout/MainLayout';
import HeroSection from '@/sections/HeroSection';
import CategoryProductsSection from '@/sections/CategoryProductsSection';

const homeTemplate: Template = {
  layout: {
    component: MainLayout,
  },
  sections: {
    order: ['hero', 'electronics', 'sport', 'toys'],
    hero: {
      component: HeroSection,
      settings: {},
    },
    electronics: {
      component: CategoryProductsSection,
      settings: { categoryKey: 'electronics' },
    },
    sport: {
      component: CategoryProductsSection,
      settings: { categoryKey: 'sport' },
    },
    toys: {
      component: CategoryProductsSection,
      settings: { categoryKey: 'toys' },
    },
  },
};

export default homeTemplate;
