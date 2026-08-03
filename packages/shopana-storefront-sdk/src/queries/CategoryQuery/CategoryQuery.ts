import { graphql } from "relay-runtime";

const CategoryQuery = graphql`
  query CategoryQuery(
    $handle: String!
    $first: Int = 24
    $after: Cursor
    $sort: ListingSort = MANUAL
    $filters: [ListingFilterInput!] = []
  ) {
    category: categoryByHandle(handle: $handle) {
      id
      title: name
      handle
      description {
        text
        html
        json
      }
      ...Listing
        @arguments(first: $first, after: $after, sort: $sort, filters: $filters)
    }
  }
`;

export default CategoryQuery;
