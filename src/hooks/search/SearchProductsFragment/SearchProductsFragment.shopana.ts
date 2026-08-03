import { graphql } from "relay-runtime";

const SearchProductsFragment = graphql`
  fragment SearchProductsFragment on ProductConnection {
    totalCount
    sort
    availableSorts
    filters {
        id
        handle: id
        label
        title: label
        type
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
          ...useListingProductCardFragment_product
            @arguments(withOptions: true)
        }
      }
  }
`;

export default SearchProductsFragment;
