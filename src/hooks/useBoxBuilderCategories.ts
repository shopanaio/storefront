import { BOX_BUILDER_CONFIG } from "@src/modules/box-builder/config/categories";

export const useBoxBuilderCategories = () => {
  return {
    categories: BOX_BUILDER_CONFIG.step2.categories,
    error: null,
    loading: false,
  };
};
