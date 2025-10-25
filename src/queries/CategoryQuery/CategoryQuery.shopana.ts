import { graphql } from "relay-runtime";

const CategoryQuery = graphql`
  query CategoryQuery(
    $handle: String!
    $first: Int = 24
    $after: Cursor
    $sort: ListingSort = MOST_RELEVANT
    $filters: [FilterInput!] = []
  ) {
    category(handle: $handle) {
      id
      title
      handle
      description
      ...Listing
        @arguments(first: $first, after: $after, sort: $sort, filters: $filters)
    }
  }
`;

export default CategoryQuery;

