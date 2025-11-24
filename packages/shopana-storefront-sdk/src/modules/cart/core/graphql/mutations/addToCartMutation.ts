import { graphql } from 'react-relay';

/**
 * Mutation for adding items to cart
 */
export const addToCartMutation = graphql`
  mutation useAddItemToCartMutation($input: CheckoutLinesAddInput!) {
    checkoutMutation {
      checkoutLinesAdd(input: $input) {
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
