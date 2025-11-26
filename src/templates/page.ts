// Generic page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";

const pageTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: 'Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default pageTemplate;
