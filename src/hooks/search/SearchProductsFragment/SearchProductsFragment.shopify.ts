import { graphql } from "relay-runtime";

const SearchProductsFragment = graphql`
  fragment SearchProductsFragment on SearchResultItemConnection {
    totalCount
    productFilters {
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
`;

export default SearchProductsFragment;