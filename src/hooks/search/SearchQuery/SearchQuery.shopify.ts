import { graphql } from "relay-runtime";

const SearchQuery = graphql`
  query SearchQuery(
    $query: String!
    $first: Int = 12
    $after: String
    $sortKey: SearchSortKeys = RELEVANCE
    $productFilters: [ProductFilter!] = []
  ) {
    search(
      query: $query
      first: $first
      after: $after
      sortKey: $sortKey
      productFilters: $productFilters
    ) {
      ...SearchProductsFragment
    }
  }
`;

export default SearchQuery;