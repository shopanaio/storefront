import { graphql } from "react-relay";

/**
 * Fragment for cart line (checkout line) data
 * Use with readInlineData since it's marked as @inline
 */
export const CartLineFragment_line = graphql`
  fragment CartLineFragment_line on CheckoutLine @inline {
    id
    quantity
    cost {
      unitPrice {
        currencyCode
        amount
      }
      compareAtUnitPrice {
        currencyCode
        amount
      }
      subtotalAmount {
        currencyCode
        amount
      }
      totalAmount {
        currencyCode
        amount
      }
    }
    purchasableId
    purchasable {
      ... on ProductVariant {
        id
        title
        handle
        product {
          id
          title
          handle
        }
        cover: featuredMedia {
          id
          ... on MediaImage { image { url } }
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        isAvailable: availableForSale
        currentlyNotInStock
        quantityAvailable
        selectedOptions {
          name
          value
          option { id handle name }
          optionValue { id handle name }
        }
      }
    }
    children {
      id
      quantity
    }
    image {
      id
      image { url width height altText }
    }
    purchase {
      type
    }
    attributes
    tag {
      id
      slug
      unique
    }
  }
`;
