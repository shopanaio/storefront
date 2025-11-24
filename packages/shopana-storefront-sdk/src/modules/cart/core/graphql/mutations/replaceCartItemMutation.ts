import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for replacing cart items
 * Moves quantity from one cart line to a different purchasable (product variant)
 */
export const replaceCartItemMutation = graphql`
  mutation replaceCartItemMutation($input: CheckoutLinesReplaceInput!) {
    checkoutMutation {
      checkoutLinesReplace(input: $input) {
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
