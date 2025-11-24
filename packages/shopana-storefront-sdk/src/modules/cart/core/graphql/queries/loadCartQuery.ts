import { graphql } from "react-relay";
import '../fragments/CartFragment';

/**
 * Query for loading cart by checkout ID
 * Uses checkoutQuery to fetch checkout data
 */
export const loadCartQuery = graphql`
  query loadCartQuery($checkoutId: ID!) {
    checkoutQuery {
      checkout(id: $checkoutId) {
        ...CartFragment_cart
      }
    }
  }
`;
