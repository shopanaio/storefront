import { graphql } from 'relay-runtime';

export const CollectionProductCardFragment = graphql`
  fragment CollectionProductCardFragment on ProductVariant {
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

export { default as CollectionProductCardFragmentNode } from './__generated__/CollectionProductCardFragment.graphql';
export type { CollectionProductCardFragment$key, CollectionProductCardFragment$data } from './__generated__/CollectionProductCardFragment.graphql';
