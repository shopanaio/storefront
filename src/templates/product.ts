import type { Template } from "@shopana/storefront-sdk/core/types";
import { ProductInfoSection } from "@/sections/test/ProductInfoSection";
import { ProductVariantsSection } from "@/sections/test/ProductVariantsSection";

const productTemplate: Template = {
  sections: {
    order: ['productInfo', 'variants'],
    productInfo: {
      component: ProductInfoSection,
      settings: {},
    },
    variants: {
      component: ProductVariantsSection,
      settings: {},
    },
  },
};

export default productTemplate;
