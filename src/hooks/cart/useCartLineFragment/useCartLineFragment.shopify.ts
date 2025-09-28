import { graphql } from "react-relay";

export const useCartLineFragment_CartLineFragment = graphql`
  fragment useCartLineFragment_CartLineFragment on CartLine {
    id
    quantity
    cost {
      amountPerQuantity {
        amount
        currencyCode
      }
      compareAtAmountPerQuantity {
        amount
        currencyCode
      }
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        sku
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          id
          url
          altText
          width
          height
        }
        product {
          id
          title
          handle
          description
        }
      }
    }
    discountAllocations {
      discountedAmount {
        amount
        currencyCode
      }
    }
    attributes {
      key
      value
    }
    sellingPlanAllocation {
      sellingPlan {
        id
        name
        description
      }
    }
  }
`;
