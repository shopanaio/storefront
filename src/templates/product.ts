// Product page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";

const productTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: 'Product Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default productTemplate;
