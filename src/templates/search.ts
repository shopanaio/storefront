// Search page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";

const searchTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: 'Search Page',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default searchTemplate;
