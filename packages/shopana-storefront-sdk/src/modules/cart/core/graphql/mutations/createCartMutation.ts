import { graphql } from 'react-relay';
import '../fragments/CartFragment';

/**
 * Mutation for creating a new cart (checkout)
 */
export const createCartMutation = graphql`
  mutation createCartMutation($input: CheckoutCreateInput!) {
    checkoutCreate(input: $input) {
      checkout {
        id
        ...CartFragment_cart
      }
      errors: userErrors { code field message retryable }
    }
  }
`;
