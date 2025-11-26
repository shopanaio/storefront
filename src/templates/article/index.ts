// Article page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";

const articleTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: 'Article Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default articleTemplate;
