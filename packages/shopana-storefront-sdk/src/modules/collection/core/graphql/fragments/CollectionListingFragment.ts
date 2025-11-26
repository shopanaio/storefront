import { graphql } from 'relay-runtime';

export const CollectionListingFragment = graphql`
  fragment CollectionListingFragment on Category
  @refetchable(queryName: "CollectionListingPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 25 }
    after: { type: "Cursor" }
    sort: { type: "ListingSort", defaultValue: MOST_RELEVANT }
    filters: { type: "[FilterInput!]", defaultValue: [] }
  ) {
    title
    handle
    listing(first: $first, after: $after, sort: $sort, filters: $filters)
      @connection(key: "CollectionListingFragment_listing") {
      totalCount
      filters {
        id
        iid
        handle
        title
        ... on PriceRangeFilter {
          minPrice {
            amount
            currencyCode
          }
          maxPrice {
            amount
            currencyCode
          }
        }
        ... on RatingRangeFilter {
          minRate
          maxRate
        }
        ... on ListFilter {
          values {
            id
            iid
            handle
            title
            count
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ... on ProductVariant {
            ...CollectionProductCardFragment
          }
        }
      }
    }
  }
`;

export { default as CollectionListingFragmentNode } from './__generated__/CollectionListingFragment.graphql';
export type { CollectionListingFragment$key, CollectionListingFragment$data } from './__generated__/CollectionListingFragment.graphql';
