import { graphql } from "relay-runtime";

const SearchQuery = graphql`
  query SearchQuery(
    $query: String!
    $first: Int = 12
    $after: Cursor
    $sort: ListingSort = MOST_RELEVANT
    $filters: [FilterInput!] = []
  ) {
    search(input: { query: $query }) {
      products(first: $first, after: $after, sort: $sort, filters: $filters) {
        ...SearchProductsFragment
      }
    }
  }
`;

export default SearchQuery;