import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for replacing cart items
 * Moves quantity from one cart line to a different purchasable (product variant)
 */
export const replaceCartItemMutation = graphql`
  mutation replaceCartItemMutation($input: CheckoutLinesReplaceInput!) {
    checkoutLinesReplace(input: $input) {
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
