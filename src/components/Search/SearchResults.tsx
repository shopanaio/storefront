import React from 'react';
import usePredictiveSearch from '@src/hooks/search/usePredictiveSearch';
import SearchResultsContent from './SearchResultsContent';

interface SearchResultsProps {
  searchTerm: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchTerm }) => {
  const { products, categories, articles, loading } =
    usePredictiveSearch(searchTerm);

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
