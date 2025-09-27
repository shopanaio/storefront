import { BOX_BUILDER_CONFIG } from "../config/categories";

export const useBoxBuilderCategories = () => {
  return {
    categories: BOX_BUILDER_CONFIG.step2.categories,
    error: null,
    loading: false,
    config: BOX_BUILDER_CONFIG.step2,
  };
};
