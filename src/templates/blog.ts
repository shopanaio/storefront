import type { Template } from "@shopana/storefront-sdk/core/types";
import HelloSection from '@/sections/HelloSection';

const blogTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: HelloSection,
      settings: {
        title: 'Blog Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default blogTemplate;
