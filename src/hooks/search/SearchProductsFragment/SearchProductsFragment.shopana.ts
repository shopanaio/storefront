import { graphql } from "relay-runtime";

const SearchProductsFragment = graphql`
  fragment SearchProductsFragment on ListingConnection {
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
          ... on Product {
            ...useListingProductCardFragment_product
              @arguments(withOptions: true)
          }
        }
      }
  }
`;

export default SearchProductsFragment;