// Collection page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";

const collectionTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: 'Collection Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default collectionTemplate;
