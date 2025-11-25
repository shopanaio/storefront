// Cart page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import HelloSection from '@/sections/HelloSection';

const cartTemplate: Template = {
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

export default cartTemplate;
