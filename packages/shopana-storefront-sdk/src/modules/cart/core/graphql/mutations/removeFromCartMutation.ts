import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for removing items from cart
 */
export const removeFromCartMutation = graphql`
  mutation removeFromCartMutation($input: CheckoutLinesDeleteInput!) {
    checkoutMutation {
      checkoutLinesDelete(input: $input) {
        checkout {
          id
          ...CartFragment_cart
        }
        errors {
          field
          message
        }
      }
    }
  }
`;
