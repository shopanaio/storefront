import type { Template } from "@shopana/storefront-sdk/core/types";
import { SearchResultsSection } from "@/sections/test/SearchResultsSection";

const searchTemplate: Template = {
  sections: {
    order: ['searchResults'],
    searchResults: {
      component: SearchResultsSection,
      settings: {},
    },
  },
};

export default searchTemplate;
