import { graphql } from "relay-runtime";

export const Listing = graphql`
  fragment Listing on Category
  @refetchable(queryName: "CategoryListingPaginationQuery")
  @argumentDefinitions(
    first: { type: "Int", defaultValue: 25 }
    after: { type: "Cursor" }
    sort: { type: "ListingSort", defaultValue: MOST_RELEVANT }
    filters: { type: "[FilterInput!]", defaultValue: [] }
  ) {
    title
    handle
    listing(first: $first, after: $after, sort: $sort, filters: $filters)
      @connection(key: "ListingFragment_listing") {
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
            ...useListingProductCardFragment_product
              @arguments(withOptions: true)
          }
        }
      }
    }
  }
`;
