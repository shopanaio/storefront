import { graphql } from "react-relay";

export const useCartLineFragment_CartLineFragment = graphql`
  fragment useCartLineFragment_CartLineFragment on CheckoutLine @inline {
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
      }
    }
    children {
      id
      quantity
    }
  }
`;
