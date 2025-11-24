import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for creating a new cart (checkout)
 */
export const createCartMutation = graphql`
  mutation createCartMutation($input: CheckoutCreateInput!) {
    checkoutMutation {
      checkoutCreate(input: $input) {
        id
        ...CartFragment_cart
      }
    }
  }
`;
