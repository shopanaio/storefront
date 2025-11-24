import { graphql } from 'react-relay';

/**
 * Fragment for cart (checkout) data
 * Use with useFragment hook
 */
export const useCart_CartFragment = graphql`
  fragment useCart_CartFragment on Checkout {
    id
    createdAt
    updatedAt
    totalQuantity
    cost {
      subtotalAmount {
        currencyCode
        amount
      }
      totalDiscountAmount {
        currencyCode
        amount
      }
      totalTaxAmount {
        currencyCode
        amount
      }
      totalAmount {
        currencyCode
        amount
      }
      totalShippingAmount {
        currencyCode
        amount
      }
    }
    customerNote
    notifications {
      code
      severity
      isDismissed
    }
    lines {
      ...useCartLineFragment_CartLineFragment
    }
  }
`;
