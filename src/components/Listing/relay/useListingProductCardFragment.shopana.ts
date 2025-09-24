import { useListingProductCardFragment_product$key } from "@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql";
import { graphql, useFragment } from "react-relay";

const UseProductCardFragment = graphql`
  fragment useListingProductCardFragment_product on ProductVariant
  @argumentDefinitions(withOptions: { type: "Boolean!", defaultValue: false }) {
    id
    title
    handle
    description
    rating {
      rating
      count
    }
    cover {
      id
      url
      source
    }
    gallery(first: 2) {
      edges {
        node {
          id
          url
          source
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
            source
          }
          displayType
        }
      }
    }
    selectedOptions @include(if: $withOptions)
  }
`;

const useListingProductCardFragment = (
  ref: useListingProductCardFragment_product$key
) => {
  const productData = useFragment(UseProductCardFragment, ref);

  return productData;
};

export default useListingProductCardFragment;
