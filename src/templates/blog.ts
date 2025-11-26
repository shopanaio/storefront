import type { Template } from "@shopana/storefront-sdk/core/types";

const blogTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: 'Blog Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default blogTemplate;
