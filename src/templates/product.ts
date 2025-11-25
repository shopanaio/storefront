// Product page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";
import HelloSection from '@/sections/HelloSection';

const productTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: 'Product Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default productTemplate;
