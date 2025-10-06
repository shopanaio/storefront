import { graphql } from 'react-relay';

export const loadCheckoutQuery = graphql`
  query loadCheckoutQuery($checkoutId: ID!) {
    checkoutQuery {
      checkout(id: $checkoutId) {
        ...useCheckoutFragment
      }
    }
  }
`;
