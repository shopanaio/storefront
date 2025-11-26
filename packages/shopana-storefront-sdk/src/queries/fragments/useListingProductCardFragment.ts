import { graphql } from "relay-runtime";

export const useListingProductCardFragment = graphql`
  fragment useListingProductCardFragment_product on ProductVariant
  @argumentDefinitions(withOptions: { type: "Boolean!", defaultValue: false }) {
    id
    title
    handle
    description
    product {
      id
      handle
      title
    }
    rating {
      rating
      count
    }
    cover {
      id
      url
    }
    gallery(first: 20) {
      edges {
        node {
          id
          url
        }
      }
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    stockStatus {
      handle
      isAvailable
    }
    options @include(if: $withOptions) {
      id
      handle
      title
      displayType
      values {
        id
        title
        handle
        swatch {
          id
          color
          color2
          image {
            id
            url
          }
          displayType
        }
      }
    }
    selectedOptions @include(if: $withOptions)
  }
`;

export default useListingProductCardFragment;
