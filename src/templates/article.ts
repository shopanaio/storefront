// Article page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import MainLayout from '@/layout/MainLayout';
import HelloSection from '@/sections/HelloSection';

const articleTemplate: Template = {
  layout: { component: MainLayout },
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: 'Article Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default articleTemplate;
