import { graphql } from 'react-relay';

export const loadCheckoutQuery = graphql`
  query loadCheckoutQuery($checkoutId: ID!) {
    checkout(id: $checkoutId) {
      ...useCheckoutFragment
    }
  }
`;
