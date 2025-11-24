import { graphql } from "react-relay";

/**
 * Query for loading cart by checkout ID
 * Uses checkoutQuery to fetch checkout data
 */
export const loadCartQuery = graphql`
  query loadCartQuery($checkoutId: ID!) {
    checkoutQuery {
      checkout(id: $checkoutId) {
        ...useCart_CartFragment
      }
    }
  }
`;
