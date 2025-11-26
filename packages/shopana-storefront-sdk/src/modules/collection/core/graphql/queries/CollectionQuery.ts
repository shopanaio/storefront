import { graphql } from 'relay-runtime';

export const CollectionQuery = graphql`
  query CollectionQuery(
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
      ...CollectionListingFragment
        @arguments(first: $first, after: $after, sort: $sort, filters: $filters)
    }
  }
`;

export { default as CollectionQueryNode } from './__generated__/CollectionQuery.graphql';
export type { CollectionQuery as CollectionQueryType } from './__generated__/CollectionQuery.graphql';
