import React from "react";
import usePredictiveSearch from "@src/hooks/search/usePredictiveSearch";
import SearchResultsContent from "./SearchResultsContent";
import { SearchResultsSkeleton } from "./SearchResultsSkeleton";

interface SearchResultsProps {
  searchTerm: string;
  initialLoading?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchTerm,
  initialLoading = false
}) => {
  const { products, categories, articles, loading } =
    usePredictiveSearch(searchTerm);

  if (initialLoading) {
    return <SearchResultsSkeleton />;
  }

  return (
    <SearchResultsContent
      products={products}
      categories={categories}
      articles={articles}
      searchTerm={searchTerm}
    />
  );
};

export default SearchResults;
