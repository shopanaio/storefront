// Generic page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import HelloSection from '@/sections/HelloSection';

const pageTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: 'Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default pageTemplate;
