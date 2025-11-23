// Search page template (placeholder)
import type { Template, PageDataLoader } from '@shopana/next-ecommerce-core';
import MainLayout from '@/layout/MainLayout';
import HelloSection from '@/sections/HelloSection';

const searchTemplate: Template = {
  layout: { component: MainLayout },
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: 'Search Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export const loadData: PageDataLoader = async () => ({});

export default searchTemplate;
