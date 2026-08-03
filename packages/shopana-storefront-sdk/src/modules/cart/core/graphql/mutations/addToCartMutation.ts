import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for adding items to cart
 */
export const addToCartMutation = graphql`
  mutation addToCartMutation($input: CheckoutLinesAddInput!) {
    checkoutLinesAdd(input: $input) {
      checkout {
        ...CartFragment_cart
      }
      errors: userErrors {
        code
        field
        message
        retryable
      }
    }
  }
`;
