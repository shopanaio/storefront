import { graphql } from "react-relay";

/**
 * Query to load a checkout by ID for Shopana platform.
 * Uses the useCheckout_CheckoutFragment to ensure consistent checkout data structure.
 */
export const loadCheckoutQuery = graphql`
  query loadCheckoutQuery($checkoutId: ID!) {
    checkoutQuery {
      checkout(id: $checkoutId) {
        ...useCheckout_CheckoutFragment
      }
    }
  }
`;
