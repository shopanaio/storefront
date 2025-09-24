import { graphql } from "react-relay";

// NOTE: loadCart не существует в схеме Shopana
// Вместо этого нужно использовать checkoutQuery для получения checkout по ID
export const loadCartQuery = graphql`
  query loadCartMutationQuery($checkoutId: ID!) {
    checkoutQuery {
      checkout(id: $checkoutId) {
        ...useCart_CartFragment
      }
    }
  }
`;
