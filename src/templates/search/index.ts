import type { Template } from "@shopana/storefront-sdk/core/types";
import SearchPageSection from "./sections/SearchPageSection";

// Atoms
export { SearchInput } from "./atoms/SearchInput";
export { SearchProductCard } from "./atoms/SearchProductCard";
export { SearchProductSkeleton } from "./atoms/SearchProductSkeleton";

// Blocks
export { DesktopSearch } from "./blocks/DesktopSearch";
export { MobileSearch } from "./blocks/MobileSearch";
export { default as SearchResults } from "./blocks/SearchResults";
export { default as SearchResultsContent } from "./blocks/SearchResultsContent";
export { SearchResultsSkeleton } from "./blocks/SearchResultsSkeleton";
export { SearchListingProducts } from "./blocks/SearchListingProducts";
export { SearchPageContent } from "./blocks/SearchPageContent";

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
