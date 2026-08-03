import { graphql } from 'relay-runtime';

export const ProductComponentItemFragment = graphql`
  fragment ProductComponentItemFragment on ProductComponentItem {
    id
    title
    selected
    required
    availableForSale
    quantity
    minQuantity
    maxQuantity
    unitPrice {
      amount
      currencyCode
    }
    totalPrice {
      amount
      currencyCode
    }
    featuredMedia {
      id
      ... on MediaImage {
        image {
          id
          url
          width
          height
          altText
        }
      }
    }
    cover: featuredMedia {
      id
      ... on MediaImage {
        image {
          id
          url
          width
          height
          altText
        }
      }
    }
    product {
      id
      title
      handle
    }
    variant {
      id
      title
      handle
      sku
      isDefault
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      availableForSale
      currentlyNotInStock
      quantityAvailable
      requiresShipping
      weight {
        value
        unit
      }
      dimensions {
        width
        height
        length
        unit
      }
      selectedOptions {
        name
        value
        option {
          id
          handle
          name
        }
        optionValue {
          id
          handle
          name
        }
      }
      featuredMedia {
        id
        ... on MediaImage {
          image {
            id
            url
            width
            height
            altText
          }
        }
      }
      media(first: 20) {
        totalCount
        edges {
          cursor
          node {
            id
            alt
            mediaContentType
            ... on MediaImage {
              image {
                id
                url
                width
                height
                altText
              }
            }
          }
        }
      }
      createdAt
      updatedAt
    }
    node: variant {
      id
      title
      handle
      price {
        amount
        currencyCode
      }
      product {
        id
        title
        handle
      }
      cover: featuredMedia {
        id
        ... on MediaImage {
          image {
            id
            url
            width
            height
            altText
          }
        }
      }
    }
  }
`;

export {
  default as ProductComponentItemFragmentNode,
} from './__generated__/ProductComponentItemFragment.graphql';
export type {
  ProductComponentItemFragment$data,
  ProductComponentItemFragment$key,
} from './__generated__/ProductComponentItemFragment.graphql';
