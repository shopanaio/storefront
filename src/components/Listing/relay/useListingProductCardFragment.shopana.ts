import { useListingProductCardFragment_product$key } from '@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql';
import { graphql, useFragment } from 'react-relay';

const UseProductCardFragment = graphql`
  fragment useListingProductCardFragment_product on ProductVariant
  @argumentDefinitions(withOptions: { type: "Boolean!", defaultValue: false }) {
    id
    title
    handle
    description
    product {
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
    gallery(first: 2) {
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

const useListingProductCardFragment = (
  ref: useListingProductCardFragment_product$key
) => {
  const productData = useFragment(UseProductCardFragment, ref);

  // Parent product title may not exist in old generated types until relay recompiled
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parentTitle: string | undefined = (productData as any)?.product?.title;
  const concatenatedTitle = [parentTitle, productData.title]
    .filter(Boolean)
    .join(' ');

  // Preserve original shape and override title and handle (use product handle in URLs)
  return {
    ...(productData as any),
    title: concatenatedTitle,
    // prefer product handle for URL building, keep variant handle separately
    handle: (productData as any)?.product?.handle ?? productData.handle,
    variantHandle: productData.handle,
  } as typeof productData;
};

export default useListingProductCardFragment;
