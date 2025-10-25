import { graphql } from "relay-runtime";

const Listing = graphql`
  fragment Listing on Collection
  @refetchable(queryName: "CollectionListingPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 25 }
    after: { type: "String" }
    sortKey: { type: "ProductCollectionSortKeys", defaultValue: COLLECTION_DEFAULT }
    filters: { type: "[ProductFilter!]", defaultValue: [] }
  ) {
    title
    handle
    listing: products(first: $first, after: $after, sortKey: $sortKey, filters: $filters)
      @connection(key: "ListingFragment_listing") {
      filters {
        id
        label
        type
        values {
          id
          label
          count
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
          ... on Product {
            ...useListingProductCardFragment_product
          }
        }
      }
    }
  }
`;

export default Listing;

