import { graphql } from 'relay-runtime';

export const SearchProductCardFragment = graphql`
  fragment SearchProductCardFragment on ProductVariant {
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
    options {
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
    selectedOptions
  }
`;

export { default as SearchProductCardFragmentNode } from './__generated__/SearchProductCardFragment.graphql';
export type { SearchProductCardFragment$key, SearchProductCardFragment$data } from './__generated__/SearchProductCardFragment.graphql';
