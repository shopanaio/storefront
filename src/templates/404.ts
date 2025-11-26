// 404 page template (placeholder)
import type { Template } from "@shopana/storefront-sdk/core/types";

const notFoundTemplate: Template = {
  sections: {
    order: ['placeholder'],
    placeholder: {
      component: () => null,
      settings: {
        title: '404 - Page Not Found',
        subtitle: 'The page you are looking for does not exist.',
      },
    },
  },
};

export default notFoundTemplate;
