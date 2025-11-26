import type { Template } from '@shopana/storefront-sdk/core/types';
import SearchPageSection from './sections/SearchPageSection';

const searchTemplate: Template = {
  sections: {
    order: ['searchPage'],
    searchPage: {
      component: SearchPageSection,
      settings: {},
    },
  },
};

export default searchTemplate;
