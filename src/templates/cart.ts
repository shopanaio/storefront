// Cart page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";

const cartTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: 'Cart Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default cartTemplate;
