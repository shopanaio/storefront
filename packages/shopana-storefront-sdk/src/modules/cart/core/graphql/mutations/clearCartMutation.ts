import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for clearing all items from cart
 */
export const clearCartMutation = graphql`
  mutation clearCartMutation($input: CheckoutLinesClearInput!) {
    checkoutLinesClear(input: $input) {
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
