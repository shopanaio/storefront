import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for removing items from cart
 */
export const removeFromCartMutation = graphql`
  mutation removeFromCartMutation($input: CheckoutLinesDeleteInput!) {
    checkoutLinesDelete(input: $input) {
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
