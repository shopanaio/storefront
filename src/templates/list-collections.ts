// Collections list page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import HelloSection from '@/sections/HelloSection';

const listCollectionsTemplate: Template = {
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
