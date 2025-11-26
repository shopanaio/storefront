import type { Template } from "@shopana/storefront-sdk/core/types";
import CartPageSection from "@/sections/CartPageSection";

const cartTemplate: Template = {
  sections: {
    order: ['cartPage'],
    cartPage: {
      component: CartPageSection,
      settings: {},
    },
  },
};

export default cartTemplate;
