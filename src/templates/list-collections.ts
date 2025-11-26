// Collections list page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";

const listCollectionsTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: 'Collections List',
        subtitle: 'Coming soon...',
      },
    },
  },
};

export default listCollectionsTemplate;
