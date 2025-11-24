import { graphql } from 'react-relay';

/**
 * Mutation for clearing all items from cart
 */
export const clearCartMutation = graphql`
  mutation useClearCartMutation($input: CheckoutLinesClearInput!) {
    checkoutMutation {
      checkoutLinesClear(input: $input) {
        checkout {
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
