import type { Template } from "@shopana/storefront-sdk/core/types";
import NotFoundSection from './sections/NotFoundSection';

const notFoundTemplate: Template = {
  sections: {
    order: ['notFound'],
    notFound: {
      component: NotFoundSection,
      settings: {},
    },
  },
};

export default notFoundTemplate;
