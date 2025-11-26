import type { Template } from "@shopana/storefront-sdk/core/types";
import { CollectionInfoSection } from "@/sections/test/CollectionInfoSection";
import { CollectionProductsSection } from "@/sections/test/CollectionProductsSection";

const collectionTemplate: Template = {
  sections: {
    order: ['collectionInfo', 'products'],
    collectionInfo: {
      component: CollectionInfoSection,
      settings: {},
    },
    products: {
      component: CollectionProductsSection,
      settings: {},
    },
  },
};

export default collectionTemplate;
