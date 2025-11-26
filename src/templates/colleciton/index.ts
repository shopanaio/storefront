import type { Template } from "@shopana/storefront-sdk/core/types";
import CollectionPageSection from "./sections/CollectionPageSection";

const collectionTemplate: Template = {
  sections: {
    order: ['collectionPage'],
    collectionPage: {
      component: CollectionPageSection,
      settings: {},
    },
  },
};

export default collectionTemplate;
