import { graphql } from 'react-relay';

/**
 * Mutation for updating cart line quantity
 */
export const updateCartLineQuantityMutation = graphql`
  mutation useUpdateCartLineQuantityMutation(
    $input: CheckoutLinesUpdateInput!
  ) {
    checkoutMutation {
      checkoutLinesUpdate(input: $input) {
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
