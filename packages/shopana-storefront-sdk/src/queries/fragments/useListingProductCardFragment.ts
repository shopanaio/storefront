import { graphql } from "relay-runtime";

export const useListingProductCardFragment = graphql`
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

export default useListingProductCardFragment;
