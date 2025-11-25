// Article page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import HelloSection from '@/sections/HelloSection';

const articleTemplate: Template = {
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
