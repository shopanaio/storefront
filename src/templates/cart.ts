// Cart page template (placeholder)
import type { Template, PageDataLoader } from '@shopana/next-ecommerce-core';
import MainLayout from '@/layout/MainLayout';
import HelloSection from '@/sections/HelloSection';

const cartTemplate: Template = {
  layout: { component: MainLayout },
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: 'Cart Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export const loadData: PageDataLoader = async () => ({});

export default cartTemplate;
