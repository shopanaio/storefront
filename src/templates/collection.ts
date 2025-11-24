// Collection page template (placeholder)
import type { Template } from '@shopana/storefront-sdk';
import MainLayout from '@/layout/MainLayout';
import HelloSection from '@/sections/HelloSection';

const collectionTemplate: Template = {
  layout: { component: MainLayout },
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: 'Collection Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default collectionTemplate;
