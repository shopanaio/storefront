// Search page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import HelloSection from '@/sections/HelloSection';

const searchTemplate: Template = {
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

export default searchTemplate;
