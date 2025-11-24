import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for adding items to cart
 */
export const addToCartMutation = graphql`
  mutation addToCartMutation($input: CheckoutLinesAddInput!) {
    checkoutMutation {
      checkoutLinesAdd(input: $input) {
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
