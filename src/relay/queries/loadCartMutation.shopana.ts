import { graphql } from "react-relay";

export const loadCartMutation = graphql`
  mutation loadCartMutation($input: LoadCartInput!) {
    loadCart(input: $input) {
      cart {
        ...useCart_CartFragment
      }
      errors {
        message
      }
    }
  }
`;
