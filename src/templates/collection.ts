// Collection page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import HelloSection from '@/sections/HelloSection';

const collectionTemplate: Template = {
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
