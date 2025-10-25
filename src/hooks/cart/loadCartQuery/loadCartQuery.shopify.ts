import { graphql } from "react-relay";

export const loadCartQuery = graphql`
  query loadCartQuery($id: ID!) {
    cart(id: $id) {
      ...useCart_CartFragment
    }
  }
`;