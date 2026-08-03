import { graphql } from 'react-relay';
import './CartLineFragment';

/**
 * Fragment for cart (checkout) data
 * Use with useFragment hook
 */
export const CartFragment_cart = graphql`
  fragment CartFragment_cart on Checkout {
    id
    channelCode
    localeCode
    currencyCode
    version
    resultRevision
    valid
    issues {
      code
      message
      severity
      effect
      field
      lineId
      retryable
    }
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
    tags {
      id
      slug
      unique
    }
    lines {
      ...CartLineFragment_line
    }
  }
`;
