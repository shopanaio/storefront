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
        cover {
          id
          url
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
      }
    }
    children {
      id
      quantity
    }
  }
`;
