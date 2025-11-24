import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for updating cart line quantity
 */
export const updateCartLineQuantityMutation = graphql`
  mutation updateCartLineQuantityMutation(
    $input: CheckoutLinesUpdateInput!
  ) {
    checkoutMutation {
      checkoutLinesUpdate(input: $input) {
        checkout {
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
