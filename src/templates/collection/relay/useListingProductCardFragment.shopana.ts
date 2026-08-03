import { useListingProductCardFragment_product$key } from '@src/templates/collection/relay/__generated__/useListingProductCardFragment_product.graphql';
import { graphql, useFragment } from 'react-relay';

const UseProductCardFragment = graphql`
  fragment useListingProductCardFragment_product on Product
  @argumentDefinitions(withOptions: { type: "Boolean!", defaultValue: false }) {
    id
    title
    handle
    description { text html }
    rating: reviewSummary { rating: averageRating count: reviewCount }
    cover: featuredMedia { ... on MediaImage { id image { url } } }
    gallery: media(first: 20) {
      edges { node { id ... on MediaImage { image { url } } } }
    }
    options @include(if: $withOptions) {
      id
      handle
      title: name
      displayType
      values: optionValues {
        id
        title: name
        handle
        swatch {
          color
          color2: secondaryColor
          image { id ... on MediaImage { image { url } } }
          displayType: type
        }
      }
    }
    selectedVariant: selectedOrFirstAvailableVariant {
      id title handle sku
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      isAvailable: availableForSale
      selectedOptions @include(if: $withOptions) {
        name value
        option { id handle name }
        optionValue { id handle name }
      }
    }
  }
`;

const useListingProductCardFragment = (
  ref: useListingProductCardFragment_product$key
) => {
  return useFragment(UseProductCardFragment, ref);
};

export default useListingProductCardFragment;
