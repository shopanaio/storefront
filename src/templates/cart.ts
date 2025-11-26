import type { Template } from "@shopana/storefront-sdk/core/types";
import { CartLinesSection } from "@/sections/test/CartLinesSection";
import { CartTotalSection } from "@/sections/test/CartTotalSection";

const cartTemplate: Template = {
  sections: {
    order: ['cartLines', 'cartTotal'],
    cartLines: {
      component: CartLinesSection,
      settings: {},
    },
    cartTotal: {
      component: CartTotalSection,
      settings: {},
    },
  },
};

export default cartTemplate;
