import { graphql } from 'react-relay';

/**
 * Mutation for removing items from cart
 */
export const removeFromCartMutation = graphql`
  mutation useRemoveItemFromCartMutation($input: CheckoutLinesDeleteInput!) {
    checkoutMutation {
      checkoutLinesDelete(input: $input) {
        checkout {
          id
          ...useCart_CartFragment
        }
        errors {
          field
          message
        }
      }
    }
  }
`;
