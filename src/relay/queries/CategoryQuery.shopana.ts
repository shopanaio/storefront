import { graphql } from "relay-runtime";

export const CategoryQuery = graphql`
  query CategoryQuery(
    $handle: String!
    $first: Int = 12
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
