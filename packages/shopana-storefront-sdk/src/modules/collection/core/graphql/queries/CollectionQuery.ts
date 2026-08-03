import { graphql } from 'relay-runtime';

export const CollectionQuery = graphql`
  query CollectionQuery(
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
      ...CollectionListingFragment
        @arguments(first: $first, after: $after, sort: $sort, filters: $filters)
    }
  }
`;

export { default as CollectionQueryNode } from './__generated__/CollectionQuery.graphql';
export type { CollectionQuery as CollectionQueryType } from './__generated__/CollectionQuery.graphql';
