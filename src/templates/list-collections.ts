// Collections list page template (placeholder)
import type { Template } from '@shopana/storefront-sdk';
import MainLayout from '@/layout/MainLayout';
import HelloSection from '@/sections/HelloSection';

const listCollectionsTemplate: Template = {
  layout: { component: MainLayout },
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: 'Collections List',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default listCollectionsTemplate;
