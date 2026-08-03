import { graphql } from 'relay-runtime';

export const CollectionListingFragment = graphql`
  fragment CollectionListingFragment on Category
  @refetchable(queryName: "SDKCollectionListingPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 25 }
    after: { type: "Cursor" }
    sort: { type: "ListingSort", defaultValue: MANUAL }
    filters: { type: "[ListingFilterInput!]", defaultValue: [] }
  ) {
    title: name
    handle
    listing: products(first: $first, after: $after, sort: $sort, filters: $filters)
      @connection(key: "CollectionListingFragment_listing") {
      totalCount
      sort
      availableSorts
      filters {
        id
        handle: id
        label
        title: label
        type
        presentation
        selectionMode
        priceRange {
          min { amount currencyCode }
          max { amount currencyCode }
          selectedMin { amount currencyCode }
          selectedMax { amount currencyCode }
        }
        values {
          id
          handle: id
          label
          title: label
          count
          selected
          input
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...CollectionProductCardFragment
        }
      }
    }
  }
`;

export { default as CollectionListingFragmentNode } from './__generated__/CollectionListingFragment.graphql';
export type { CollectionListingFragment$key, CollectionListingFragment$data } from './__generated__/CollectionListingFragment.graphql';
