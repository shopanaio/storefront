import { graphql } from 'react-relay';

/**
 * Mutation for creating a new cart (checkout)
 */
export const createCartMutation = graphql`
  mutation useCreateCartMutation($input: CheckoutCreateInput!) {
    checkoutMutation {
      checkoutCreate(input: $input) {
        id
        ...useCart_CartFragment
      }
    }
  }
`;
