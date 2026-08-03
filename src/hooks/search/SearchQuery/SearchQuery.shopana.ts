import { graphql } from "relay-runtime";

const SearchQuery = graphql`
  query SearchQuery(
    $query: String!
    $first: Int = 12
    $after: Cursor
    $sort: ListingSort = RELEVANCE
    $filters: [ListingFilterInput!] = []
  ) {
    searchProducts(query: $query, first: $first, after: $after, sort: $sort, filters: $filters) {
      ...SearchProductsFragment
    }
  }
`;

export default SearchQuery;
