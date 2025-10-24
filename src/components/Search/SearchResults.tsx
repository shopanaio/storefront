import React from 'react';
import usePredictiveSearch from '@src/hooks/search/usePredictiveSearch';
import SearchResultsContent from './SearchResultsContent';

interface SearchResultsProps {
  searchTerm: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchTerm }) => {
  const { products } = usePredictiveSearch(searchTerm);

  return <SearchResultsContent products={products} searchTerm={searchTerm} />;
};

export default SearchResults;
